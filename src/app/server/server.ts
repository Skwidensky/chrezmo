export {};
const Express = require('express');
const app = Express();
const neo4j = require('neo4j-driver');
const apoc = require('apoc');
const fs = require('fs');
const https = require('https');
const http = require('http');
const privateKey = fs.readFileSync(`${__dirname}/privkey1.pem`);
const certificate = fs.readFileSync(`${__dirname}/fullchain1.pem`);

// #region DB setup and query formation
const driver = neo4j.default.driver('bolt://localhost:7687', neo4j.default.auth.basic('neo4j', 'password'));
const DELIMITER = "&";
var session: any;
// Returns a promise of a DB result
function fetchShortestPathQuery(pair: any) {
    session = driver.session();
    return session.run(makeShortestPathQueryString(pair));
}
// Forms a Cypher query to find the shortest path between two nodes and returns a promise of a DB result
function makeShortestPathQueryString(pair: any) {
    escapeCharacters(pair);
    var first = pair[0];
    var second = pair[1];
    var q = "MATCH (p0:Page {title:\'" + first + "\'}), (p1:Page {title:\'" + second + "\'}), path = allShortestPaths((p0)-[*..6]-(p1)) RETURN path";
    return q;
}
function formShortestPathQueryReturn(result: any, res: any) {
    const nodes: any = {};
    const links: any = [];
    result.records.map((r: any) => {
        var segments = r._fields[0].segments;
        for (var i = 0; i < segments.length; i++) {
            var segment = segments[i];
            var source = segment.start;
            var sourceNode = { title: source.properties.title, id: source.identity.low };
            nodes[source.identity.low] = sourceNode;
            var target = segment.end;
            var targetNode = { title: target.properties.title, id: target.identity.low };
            nodes[target.identity.low] = targetNode;
            links.push({ sourceTitle: sourceNode.title, source: sourceNode.id, targetTitle: targetNode.title, target: targetNode.id });
        }
    })
    res.send({ nodes: nodes, links: links });
    session.close();
}
// Returns a promise of a DB result
function fetchQuery(queries: any, limit: any) {
    session = driver.session();
    return session.run(makeLimitedQueryString(queries, limit));
}
// Forms a Cypher query for the chosen nodes, limiting child-nodes for each source-node to $limit
function makeLimitedQueryString(queries: any, limit: any) {
    escapeCharacters(queries);
    let qArr = queries.map((x: any) => "'" + x + "'").toString()
    var query = "";
    const returnStatement = "RETURN { id: id(p0), title:p0.title } as source, { id: id(p), title:p.title } as target ";
    var i;
    for (i = 0; i < queries.length; i++) {
        var subject = queries[i];
        if (i == 0) {
            query += `MATCH (p0:Page{title:\'${subject}\'})-[:Link]->(p:Page) ` + returnStatement + `LIMIT ${limit} `;
        } else {
            query += `UNION MATCH (p0:Page{title:\'${subject}\'})-[:Link]->(p:Page) ` + returnStatement + `LIMIT ${limit} `;
        }
    }
    query += `UNION MATCH (p0:Page)-[:Link]->(p:Page)<-[:Link]-(p1:Page) WHERE p0.title IN [${qArr}] AND p1.title IN [${qArr}] `;
    query += returnStatement;
    return query;
}
function formQueryReturn(result: any, res: any) {
    const nodes: any = {};
    const links: any = result.records.map((r: any) => {
        var source = r.get('source');
        source.id = source.id.toNumber();
        nodes[source.id] = source;
        var target = r.get('target');
        target.id = target.id.toNumber();
        nodes[target.id] = target;
        // var rel = r.get('rel'); if (rel.weight) { rel.weight = rel.weight.toNumber(); }
        return { sourceTitle: source.title, source: source.id, targetTitle: target.title, target: target.id };
    })
    res.send({ nodes: nodes, links: links });
    session.close();
}
// #endregion DB setup and query formation
//#region Helper methods
function escapeCharacters(subjects: any) {
    var i;
    for (i = 0; i < subjects.length; i++) {
        var subject = subjects[i];
        subject = subject.replace("\'", "\\'");
        subject = subject.replace("\"", "\\\"");
        subjects[i] = subject;
    }
}
//#endregion Helper methods
// #region API
app.use((req: any, res: any, next: any) => {
    res.header('Access-Control-Allow-Origin', '*');
    next();
})
app.use(Express.static('dist/chrezmo'));
app.get('/', (req: any, res: any) => {
    res.sendFile('index.html', { root: 'dist/chrezmo' });
});
app.get("/api/query", (req: any, res: any) => {
    fetchQuery(req.query.queries.split(DELIMITER), req.query.limit).then((result: any) => {
        formQueryReturn(result, res);
    }).catch(function (error: any) {
        console.error(error);
    });
});
app.get("/api/shortestpath", (req: any, res: any) => {
    fetchShortestPathQuery(req.query.pair.split(DELIMITER)).then((result: any) => {
        formShortestPathQueryReturn(result, res);
    }).catch(function (error: any) {
        console.error(error);
    });
});
//https server
https.createServer({
    key: privateKey,
    cert: certificate
}, app).listen(443);
//http server to redirect to https
http.createServer((req: any, res: any) => {
    res.writeHead(301, {'Location': `https://${req.headers['host']}${req.url}`});
    res.end();
}).listen(80);
// #endregion API