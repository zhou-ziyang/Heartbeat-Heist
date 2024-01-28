function log(row) {
    const dataArea = document.getElementById('dataArea');
    const log_line = Date.now() + "," + row;
    dataArea.value += "\n" + log_line;
    dataArea.scrollTop = dataArea.scrollHeight;
    console.log("APPEND: " + log_line)
}

function exportData() {
    const dataArea = document.getElementById('dataArea');
    var hiddenElement = document.createElement('a');
    hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodeURI(dataArea.value);
    hiddenElement.target = '_blank';
    hiddenElement.download = 'myFile.csv';
    hiddenElement.click();
}
