$.fn.setNow = function (onlyBlank) {
  var now = new Date($.now())
    , year
    , month
    , date
    , hours
    , minutes
    , seconds
    , formattedDateTime
    ;

  year = now.getFullYear();
  month = now.getMonth().toString().length === 1 ? '0' + (now.getMonth() + 1).toString() : now.getMonth() + 1;
  date = now.getDate().toString().length === 1 ? '0' + (now.getDate()).toString() : now.getDate();
  hours = now.getHours().toString().length === 1 ? '0' + now.getHours().toString() : now.getHours();
  minutes = now.getMinutes().toString().length === 1 ? '0' + now.getMinutes().toString() : now.getMinutes();
  seconds = now.getSeconds().toString().length === 1 ? '0' + now.getSeconds().toString() : now.getSeconds();

  formattedDateTime = year + '-' + month + '-' + date + 'T' + hours + ':' + minutes + ':' + seconds;

  if ( onlyBlank === true && $(this).val() ) {
    return this;
  }

  $(this).val(formattedDateTime);

  return this;
}