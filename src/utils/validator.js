export default {
    isName: /^[a-zA-Z0-9\u4e00-\u9fa5]+$/, //中文英文数字混合
    isNumberLetterAndHorizontal: /^[0-9a-zA-Z-]+$/, // 英文数字和横杠
    isIntUp0: /^[0-9]*[1-9][0-9]*$/,
    isInt: /^\d+$/,
    isMoney: /(^[1-9]([0-9]+)?(\.[0-9]{1,2})?$)|(^(0){1}$)|(^[0-9]\.[0-9]([0-9])?$)/,
    isEmpty: /^\s*$/,
    isMobile: /^(13|14|15|16|17|18|19)[0-9]{9}$/,
    isLetter: /^[a-zA-Z]+$/,
    idLetterAndNum: /^[a-zA-Z0-9_]+$/,
    isNumAndLetterAndUnderline: /^[a-zA-Z][0-9a-zA-Z_]{0,}$/,
    isChineseAndLetter: /^[\u4e00-\u9fa5_a-zA-Z]+$/,
    isEmail: /^\w+((.\w+)|(-\w+))@[A-Za-z0-9]+((.|-)[A-Za-z0-9]+).[A-Za-z0-9]+$/,
    isChineseAndLetterAndInt: /^[0-9a-zA-Z\u4e00-\u9fa5]+$/,
    isChineseDeviceModel:/^[\u4e00-\u9fa5-_a-zA-Z0-9\/]+$/,
    isChineseSpaceModel:/^[\u4e00-\u9fa5-_a-zA-Z0-9\/\(\（\)\）]+$/,
    isEnglishDeviceModel:/^[-_a-zA-Z0-9\/]+$/
};