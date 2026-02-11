const fs = require('fs');
const vm = require('vm');
const path = require('path');

(async () => {
    try {
        const repoRoot = path.join(__dirname, '..');
        const dataPath = path.join(repoRoot, 'vocab_data.js');
        if (!fs.existsSync(dataPath)) throw new Error('vocab_data.js not found');
        const code = fs.readFileSync(dataPath, 'utf8');
        const context = { console };
        vm.createContext(context);
        // Run the vocab file and capture ALL_VOCAB_DATA
        vm.runInContext(code + '\n;result = typeof ALL_VOCAB_DATA !== "undefined" ? ALL_VOCAB_DATA : (typeof window !== "undefined" && window.ALL_VOCAB_DATA);', context);
        const ALL_VOCAB_DATA = context.result;
        if (!ALL_VOCAB_DATA) throw new Error('ALL_VOCAB_DATA not defined in vocab_data.js');

        // Try to find chapter 17
        let chapterKey = Object.keys(ALL_VOCAB_DATA).find(k => k === '17' || k === 17 || (''+k).includes('17') || (ALL_VOCAB_DATA[k].title && ALL_VOCAB_DATA[k].title && ALL_VOCAB_DATA[k].title.includes('17')));
        if (!chapterKey) chapterKey = Object.keys(ALL_VOCAB_DATA)[0];
        const chapter = ALL_VOCAB_DATA[chapterKey];
        if (!chapter) throw new Error('chapter not found');

        // choose first subcategory or data
        let list = [];
        if (chapter.subcategories) {
            const firstSubKey = Object.keys(chapter.subcategories)[0];
            list = chapter.subcategories[firstSubKey].data || [];
        } else if (chapter.data) {
            list = chapter.data;
        }
        if (!list || !list.length) throw new Error('No vocab entries in the selected chapter');

        // Build rows
        const rows = list.map(r => [String(r[0]||''), String(r[1]||''), String(r[2]||'')]);

        // Build HTML (small replica of app's function)
        function escapeHtml(s){ return (s||'').toString().replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
        function buildHtml(title, rows, options){
            const now = new Date();
            const includeIndex = options.includeIndex !== false;
            const includeType = !!options.includeType;
            const orientation = options.orientation === 'landscape' ? 'landscape' : 'portrait';
            const header = `<!doctype html><!doctype html><html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><head><meta http-equiv="Content-Type" content="text/html; charset=utf-8"/><meta charset="utf-8"><title>${escapeHtml(title)}</title><style>`+
            `@page { size: A4 ${orientation}; margin: 10mm; } body{font-family:Arial,Helvetica,sans-serif;color:#111;background:#fff;padding:6mm}`+
            `.sheet-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:12px} h1{font-size:20px;margin:0}`+
            `table{border-collapse:collapse;width:100%;margin-top:12px;font-size:12px} th,td{border:1px solid #ddd;padding:6px;text-align:left;vertical-align:top} th{background:#f3f3f8}`+
            `.nowrap { white-space:nowrap } @media print{ .no-print{display:none} table{page-break-inside:auto} tr{page-break-inside:avoid;page-break-after:auto} }`+
            `</style></head><body>`;
            let body = `<div class="sheet-header"><h1>${escapeHtml(title)}</h1><div>${now.toLocaleString()}</div></div>`;
            body += `<table><thead><tr>`;
            if (includeIndex) body += `<th class="nowrap">#</th>`;
            body += `<th>Mot</th><th>Définition</th>`;
            if (includeType) body += `<th class="nowrap">Type</th>`;
            body += `</tr></thead><tbody>`;
            rows.forEach((r,i)=>{
                const w = escapeHtml(r[0]||'');
                const d = escapeHtml(r[1]||'');
                const t = escapeHtml(r[2]||'');
                body += `<tr>`;
                if (includeIndex) body += `<td class="nowrap">${i+1}</td>`;
                body += `<td>${w}</td><td>${d}</td>`;
                if (includeType) body += `<td class="nowrap">${t}</td>`;
                body += `</tr>`;
            });
            body += `</tbody></table>`;
            body += `</body></html>`;
            const excelCfg = `<!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>${escapeHtml(title)}</x:Name><x:WorksheetOptions><x:Print><x:ValidPrinterInfo/></x:Print></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]-->`;
            return header + excelCfg + body;
        }

        const title = chapter.title || `chapter_${chapterKey}`;
        const html = buildHtml(title, rows, { includeIndex: true, includeType: true, orientation: 'portrait' });
        const bom = '\uFEFF';
        const csvHeaders = ['Index','Mot','Définition','Type'];
        const csvRows = rows.map((r,i)=> [String(i+1), r[0], r[1], r[2]].map(c=> '"'+c.replace(/"/g,'""')+'"').join(','));
        const csvContent = csvHeaders.map(h=>'"'+h+'"').join(',') + '\n' + csvRows.join('\n');

        const outHtml = path.join(repoRoot, `export_chapter_${chapterKey}.xls`);
        const outCsv = path.join(repoRoot, `export_chapter_${chapterKey}.csv`);
        // Write BOM+HTML to improve Excel detection
        fs.writeFileSync(outHtml, bom + html, 'utf8');
        fs.writeFileSync(outCsv, bom + csvContent, 'utf8');

        console.log('WROTE', outHtml);
        console.log('WROTE', outCsv);
        console.log('Entries:', rows.length);
    } catch (err) {
        console.error('ERROR', err && err.message);
        process.exit(2);
    }
})();
