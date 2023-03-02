// todo: make as class

/**
 * @param spreadsheet {SpreadsheetApp.Spreadsheet}
 * @param sheet {SpreadsheetApp.Sheet}
 * @param emails {Array.<string>}
 * @param attachmentName {string}
 * @param body {string}
 * @param senderName {string}
 * @param subject {string}
 */
function sendSheetAsPdf(spreadsheet, sheet, emails, subject, body, senderName, attachmentName) {
  Logger.log('Starting send email [%s] to [%s]', subject, emails.join(', '));
  let exportUrl = 'https://docs.google.com/spreadsheets/d/' + spreadsheet.getId() + '/export?exportFormat=pdf&format=pdf' // export as pdf / csv / xls / xlsx
    + '&size=A4' // paper size legal / letter / A4
    + '&portrait=true' // orientation, false for landscape
    + '&fitw=true' // fit to page width, false for actual size
    + '&sheetnames=false&printtitle=false' // hide optional headers and footers
    + '&pagenum=NO&gridlines=false' // hide page numbers and gridlines
    + '&fzr=false' // do not repeat row headers (frozen rows) on each page
    + '&horizontal_alignment=CENTER' //LEFT/CENTER/RIGHT
    + '&vertical_alignment=TOP' //TOP/MIDDLE/BOTTOM
    + '&gid=' + sheet.getSheetId(); // the sheet's Id
  let response = UrlFetchApp.fetch(exportUrl, {
    headers: {
      'method': 'GET',
      'Authorization': 'Bearer ' + ScriptApp.getOAuthToken(),
      'muteHttpExceptions': true
    }
  });
  let pdfBlob = response.getBlob().getBytes();
  Logger.log('Blob fetched successfully');
  MailApp.sendEmail(
    emails.join(','),
    subject,
    body,
    {
      htmlBody: body,
      name: senderName,
      attachments: [
        {
          fileName: attachmentName,
          content: pdfBlob,
          mimeType: 'application/pdf'
        }
      ]
    }
  );
  Logger.log('Mail sent successfully');
}
