var socket = io();
socket.on('schedule', function(schedule){
    schedule.forEach(function(item, index){
      $( "#contents" ).append( "'<tr><td>" + item.uid + "</td></tr>'" );
    });
});

socket.on('newData', function(newData){
    $( "#contents" ).append( "'<tr><td>" + newData.uid + "</td></tr>'" );
});
