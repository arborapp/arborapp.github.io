/**
 Sample argument
{
  "kind": "calendar#event",
  "etag": etag,
  "id": string,
  "status": string,
  "htmlLink": string,
  "created": datetime,
  "updated": datetime,
  "summary": string,
  "description": string,
  "location": string,
  "colorId": string,
  "creator": {
    "id": string,
    "email": string,
    "displayName": string,
    "self": boolean
  },
  "organizer": {
    "id": string,
    "email": string,
    "displayName": string,
    "self": boolean
  },
  "start": {
    "date": date,
    "dateTime": datetime,
    "timeZone": string
  },
  "end": {
    "date": date,
    "dateTime": datetime,
    "timeZone": string
  },
  "endTimeUnspecified": boolean,
  "recurrence": [
    string
  ],
  "recurringEventId": string,
  "originalStartTime": {
    "date": date,
    "dateTime": datetime,
    "timeZone": string
  },
  "transparency": string,
  "visibility": string,
  "iCalUID": string,
  "sequence": integer,
  "attendees": [
    {
      "id": string,
      "email": string,
      "displayName": string,
      "organizer": boolean,
      "self": boolean,
      "resource": boolean,
      "optional": boolean,
      "responseStatus": string,
      "comment": string,
      "additionalGuests": integer
    }
  ],
  "attendeesOmitted": boolean,
  "extendedProperties": {
    "private": {
      (key): string
    },
    "shared": {
      (key): string
    }
  },
  "hangoutLink": string,
  "gadget": {
    "type": string,
    "title": string,
    "link": string,
    "iconLink": string,
    "width": integer,
    "height": integer,
    "display": string,
    "preferences": {
      (key): string
    }
  },
  "anyoneCanAddSelf": boolean,
  "guestsCanInviteOthers": boolean,
  "guestsCanModify": boolean,
  "guestsCanSeeOtherGuests": boolean,
  "privateCopy": boolean,
  "locked": boolean,
  "reminders": {
    "useDefault": boolean,
    "overrides": [
      {
        "method": string,
        "minutes": integer
      }
    ]
  },
  "source": {
    "url": string,
    "title": string
  },
  "attachments": [
    {
      "fileUrl": string,
      "title": string,
      "mimeType": string,
      "iconLink": string,
      "fileId": string
    }
  ]
}
*/

// Your Client ID can be retrieved from your project in the Google
// Developer Console, https://console.developers.google.com
var CLIENT_ID = '148763818568-ip8cn4tge1cc332uva3t92n2tgmcordt.apps.googleusercontent.com';
var SCOPES = ["https://www.googleapis.com/auth/calendar"];

var announcementSource   = $("#announcement-template").html();
var announcemenTemplate = Handlebars.compile(announcementSource);

var monthMap = {
  0: "Jan",
  1: "Feb",
  2: "Mar",
  3: "Apr",
  4: "May",
  5: "Jun",
  6: "Jul",
  7: "Aug",
  8: "Sep",
  9: "Oct",
  10: "Nov",
  11: "Dec"
};

// My Firebase reference
var myFirebaseRef = new Firebase("https://arboretum-admin-dash.firebaseio.com/");
var announcementRef = new Firebase(myFirebaseRef + "announcements/");
var appCopyRef = new Firebase(myFirebaseRef + "app/");

// TODO off by one error
function parseDateTime(strDate, strTime) {
  // Get date
  strDate = strDate.split('\/');
  var out = [strDate[2], strDate[0], strDate[1] ].join('-');
  out += 'T';

  // Get time
  var timeOfDay = strTime.substring(strTime.length-2);
  var time = strTime.slice(0,-2);
  time = time.split(':');

  if (timeOfDay == 'pm') {
    time[0] = 12 + parseInt(time[0]);
  }

  out += [time[0], time[1], '00'].join(':');
  out += '-06:00';

  console.log(out);
  return out;
}

function submitCopy() {
  appCopyRef.set({
    message: document.querySelector('.copy').value
  });
}

/**
 * Check if current user has authorized this application.
 */
function checkAuth() {
  gapi.auth.authorize(
    {
      'client_id': CLIENT_ID,
      'scope': SCOPES.join(' '),
      'immediate': true
    }, handleAuthResult);
}

/**
 * Handle response from authorization server.
 *
 * @param {Object} authResult Authorization result.
 */
function handleAuthResult(authResult) {
  var authorizeDiv = document.getElementById('authorize-div');
  if (authResult && !authResult.error) {
    // Hide auth UI, then load client library.
    authorizeDiv.style.display = 'none';
    loadCalendarApi();
  } else {
    // Show auth UI, allowing the user to initiate authorization by
    // clicking authorize button.
    authorizeDiv.style.display = 'inline';
  }
}

/**
 * Initiate auth flow in response to user clicking authorize button.
 *
 * @param {Event} event Button click event.
 */
function handleAuthClick(event) {
  gapi.auth.authorize(
    {client_id: CLIENT_ID, scope: SCOPES, immediate: false},
    handleAuthResult);
  return false;
}

/**
 * Load Google Calendar client library. List upcoming events
 * once client library is loaded.
 */
function loadCalendarApi() {
  gapi.client.load('calendar', 'v3', buildRequest);
}

function buildRequest() {
  var summary = document.querySelector('.name').value;
  var location = document.querySelector('.location').value;
  var startDate = document.querySelector('.sd').value;
  var endDate = document.querySelector('.ed').value;
  var startTime = document.querySelector('.st').value;
  var endTime = document.querySelector('.et').value;
  var description = document.querySelector('.description').value;

  var fullStartDate = parseDateTime(startDate, startTime);
  var fullEndDate = parseDateTime(endDate, endTime);


  var event = {
    'summary': summary,
    'location': location,
    'description': description,
    'start': {
      'dateTime': fullStartDate,
      'timeZone': 'America/Chicago'
    },
    'end': {
      'dateTime': fullEndDate,
      'timeZone': 'America/Chicago'
    },
    'attendees': [],
    'reminders': {}
  };

  submitRequest(event);
}

function submitRequest(e) {
  console.log(e);
  var request = gapi.client.calendar.events.insert({
    'calendarId': 'primary',
    'resource': e
  });

  request.execute(function(res) {
    // appendPre('Event created: ' + e.htmlLink);
    console.log(res);
    var iframe = document.querySelector('.gCal');
    iframe.src = iframe.src;
  });
}

function firebase() {
}

function mobileAnnouncement() {
  var announcement = document.getElementById('announcementArea').value;
  console.log(announcement);
  announcementRef.push({
    timestamp: Date.now(),
    message: announcement
  });
}

function validateForm() {
  var $activeButtons =  $('.active');
  if ($activeButtons.length === 0) {
    // TODO Throw error — you have to post to somewhere ya dingus
    return;
  }

  // TODO Check for other mediums to post to
  // facebookAnnouncement();
  // googleplusAnnouncement();
  // twitterAnnouncement();
  mobileAnnouncement();
}

$(document).foundation();

$(document).ready(function() {
  $(".datepicker").datepicker({ minDate: 0, maxDate: "12M" });
  $('.timepicker').timepicker({ useSelect: true,
    'step': function(i) {
        return (i%2) ? 15 : 45;
    } });
});

announcementRef.on("child_added", function(snapshot) {
  var announcements = snapshot.val();
  console.log(announcements);

  var date = new Date(announcements.timestamp*1000);
  var prettyDate = "";
  console.dir(date);
  prettyDate += monthMap[date.getMonth()] + " " + date.getDate() + ", ";
  prettyDate += date.getHours() + ":" + date.getMinutes();

  var context = {
    message: announcements.message,
    timestamp: prettyDate
  };
  var html = announcemenTemplate(context);
  $('.feed').append(html);

}, function (errorObject) {
  console.log("The read failed: " + errorObject.code);
});

appCopyRef.on("value", function(snapshot) {
  document.querySelector('.copy').innerHTML = snapshot.val().message;
});

$('.submit').on('click', function(event) {
  handleAuthClick(event);
});

$('.media button:not(.submit)').on('click', function(e) {
  console.log(e);
  $(this).toggleClass('active');
  e.preventDefault();

  // TODO Show error message — over character count
  if (e.target.name == 'twitter') {
    if ($(this).hasClass('active')) {
      $('#announcementArea').attr('maxlength', '140');
    }
    else {
      $('#announcementArea').removeAttr('maxlength');
    }
  }
});
