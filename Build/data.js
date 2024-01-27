function saveDummy() {
    const dummy = "Timestamp,Level,Try,Type,Value\nValue1,Value2,Value3,Value4,Value5";
    saveData(dummy)
}
function saveData(data) {
    let csvString = data;
    var buttonContainer = document.getElementById('buttonContainer');
    var exportButton = document.createElement('button');
    exportButton.id = 'exportButton';
    exportButton.textContent = 'Export CSV';

    exportButton.addEventListener('click', function() {
        var hiddenElement = document.createElement('a');
        hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodeURI(csvString);
        hiddenElement.target = '_blank';
        hiddenElement.download = 'myFile.csv';
        hiddenElement.click();
    });

    buttonContainer.appendChild(exportButton);
}