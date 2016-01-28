var socket = io();
var buses = new Array();
socket.on('schedule', function(schedule){
    schedule.forEach(function(item, index){
      buses.push(item);
      var id = item['_id'];
      $( "#contents" ).append("<tr style='cursor:pointer;' onclick='showDetails(\""+id+"\");' data-toggle='modal' data-target='#"+id+"'>"
        +"<td>"+item.bus+"</td>"
        +"<td>"+item.requestTime+"</td>"
        +"<td>"+item.currentStop+"</td>"
        +"<td>"+item.nextStop+"</td>"
        +"<td>"+item.distance+"</td>"
        +"<td>"+item.expectedTime+"</td>"
        +"</tr>");
    });
});

socket.on('newData', function(newData){
    buses.push(newData);
    $( "#contents" ).append( "<tr><td>" + newData.bus + "</td></tr>" );
});

function showDetails(id){
    var bus = buses.filter(function (bus) {
        return bus['_id'] == id;
    });
    $("#bus-list").append("<div id='"+bus[0]['_id']+"' class='modal fade' role='dialog'>"
    +"<div class='modal-dialog'>"
    +"<div class='modal-content'>"
    +"<div class='modal-header'>"
    +"<button type='button' class='close' data-dismiss='modal'>&times;</button>"
    +"<h4 class='modal-title'>Entry Details</h4>"
    +"</div><div class='modal-body'>"
    +"<b>Entry Time</b>: "+bus[0].responseTime+"<br>"
    +"<b>Time Zone</b>: "+bus[0].timeZoneId+"<br>"
    +"<b>Stop Address</b>: "+bus[0].address+"<br>"
    +"<b>City</b>: "+bus[0].city+"<br>"
    +"<b>State</b>: "+bus[0].state+"<br>"
    +"<b>Country Code</b>: "+bus[0].countryCode+"<br>"
    +"<b>Postal Code</b>: "+bus[0].postalCode+"<br>"
    +"<b>Latitude</b>: "+bus[0].lat+"<br>"
    +"<b>Longitude</b>: "+bus[0].long+"<br>"
    +"<b>Delay by chip</b>: "+bus[0].delay+"<br>"
    +"<b>Average Speed till next stop</b>: "+bus[0].nextAvgSpeed+" kmph<br>"
    +"</div>"
    +"<div class='modal-footer'>"
    +"<button type='button' class='btn btn-default' data-dismiss='modal'>Close</button>"
    +"</div></div></div></div>");
}
