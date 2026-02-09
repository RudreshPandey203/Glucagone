function doPost(e) {
    // 1. Get the active sheet
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

    try {
        // 2. Parse the incoming JSON data
        // The app sends: { action: 'append', data: { date, food, calories, protein, carbs, fat, verdict } }
        var payload = JSON.parse(e.postData.contents);
        var item = payload.data;

        if (payload.action === 'append') {
            // 3. Prepare the row data
            // Ensure the order matches your sheet columns!
            // Example: Date | Food Item | Calories | Protein | Carbs | Fat | Verdict
            var row = [
                item.date,
                item.food,
                item.calories,
                item.protein,
                item.carbs,
                item.fat,
                item.verdict
            ];

            // 4. Append to the sheet
            sheet.appendRow(row);

            // Return success
            return ContentService.createTextOutput(JSON.stringify({ result: "success", row: sheet.getLastRow() }))
                .setMimeType(ContentService.MimeType.JSON);
        }

        return ContentService.createTextOutput(JSON.stringify({ result: "error", message: "Unknown action" }))
            .setMimeType(ContentService.MimeType.JSON);

    } catch (error) {
        // Return error details
        return ContentService.createTextOutput(JSON.stringify({ result: "error", message: error.toString() }))
            .setMimeType(ContentService.MimeType.JSON);
    }
}
