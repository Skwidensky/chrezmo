export class Utils {
    // regex here adds commas to thousands-place of view numbers
    public static addCommasToNumberStringThousands(numString: string) {
        return numString.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }
}