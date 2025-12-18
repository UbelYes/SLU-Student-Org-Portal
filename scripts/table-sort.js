function parseValue(text) {
    if (/\d{4}-\d{2}-\d{2}|\d{1,2}\/\d{1,2}\/\d{2,4}/.test(text)) {
        const date = new Date(text).getTime();
        if (!isNaN(date)) return date;
    }
    
    if (/^-?\d*\.?\d+$/.test(text)) {
        return parseFloat(text);
    }
    
    return text;
}

function sortTable(table, columnIndex, ascending) {
    const tbody = table.querySelector('tbody');
    const rows = Array.from(tbody.querySelectorAll('tr'));
    
    const parsed = rows.map(row => ({
        row,
        value: parseValue(row.cells[columnIndex]?.textContent.trim() || '')
    }));
    
    parsed.sort((a, b) => {
        const [x, y] = ascending ? [a.value, b.value] : [b.value, a.value];
        return typeof x === 'number' ? x - y : String(x).localeCompare(String(y));
    });
    
    tbody.innerHTML = '';
    parsed.forEach(item => tbody.appendChild(item.row));
}

function makeTableSortable(tableSelector) {
    const table = document.querySelector(tableSelector);
    if (!table) return;
    
    let last = { col: -1, asc: true };
    
    table.querySelectorAll('thead th').forEach((th, i) => {
        if (th.textContent.toLowerCase().includes('action')) return;
        
        th.style.cursor = 'pointer';
        th.style.userSelect = 'none';
        
        th.onclick = () => {
            const asc = last.col === i ? !last.asc : true;
            
            table.querySelectorAll('thead th').forEach(h => 
                h.textContent = h.textContent.replace(/ [↑↓]/g, '')
            );
            th.textContent += asc ? ' ↑' : ' ↓';
            
            sortTable(table, i, asc);
            last = { col: i, asc };
        };
    });
}
