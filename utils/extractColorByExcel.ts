/// 根据Excel清单提供的信息提取并生成JSON(Color)数据
/// Use: deno run --allow-all ./extractColorByExcel.ts # 最终会在执行命令的目录中生成一个 colors.json 文件

import XLSX from 'https://esm.sh/xlsx?no-check'; /// doc: https://github.com/SheetJS/sheetjs/issues/2217#issuecomment-951609553

function isEncoded(code: string): boolean { // 是否是业态编码
    return /^[a-zA-Z0-9]{5}$/.test(code);
}

function isHexColor(color: string): boolean { // 是否是css颜色色值
    return /^#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})$/.test(color);
}

function isNotArrayEmpty(array: any[]): boolean { // 是否是非空数组
    return array.length > 0;
}

const xlsxData: Uint8Array = Deno.readFileSync(new URL('../dist/module_color.xlsx', import.meta.url).pathname);
const workBook = XLSX.readFile(
    xlsxData.buffer as unknown as string /* Uint8Array */,
    { type: "array" }
); // as XLSX.WorkBook

const sheetNames: string[] = workBook.SheetNames; // Sheet表名称集合

// console.log('sheets', workBook.Sheets);
// console.log('sheetNames', workBook.SheetNames);
const jsonData = XLSX.utils.sheet_to_json(workBook.Sheets[sheetNames[sheetNames.length-1]]) as {[key: string]: string}[]; // 原始的Excel文件数据，提取最后一张表并转为 JSON-OBJECT 的数据
// console.log('jsonData-sheetNames-last', jsonData);
// console.log('jsonData-sheetNames-first', jsonData[0]);

const colorJson = jsonData.reduce((acc, cur) => { // color提取
    const xlsxValueArray = Object.values(cur);
    const codeArray = xlsxValueArray.filter((value) => isEncoded(value)); // 编码
    const colorArray = xlsxValueArray.filter((value) => isHexColor(value)); // 颜色色值

    if (isNotArrayEmpty(codeArray) && isNotArrayEmpty(colorArray)) {
        acc[codeArray.pop() as string] = colorArray.pop() as string;
    }

    return acc;
}, Object.create(null) as {
    [key: string] /* 编码 */: string /* 颜色色值 */
});

// console.log('颜色提取结果:', colorJson);

Deno.writeTextFileSync("colors.json", JSON.stringify(colorJson, null, 2 /* 需要压缩请设置为0 */)); // 将提取结果写入文件