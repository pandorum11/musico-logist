let musicInfo = [];
let to_playlist_process = [];
let playlist = [];

const fields = [
  'artistName',
  'trackName',
  'collectionName',
  'primaryGenreName',
  'currency',
  'collectionPrice',
  'trackPrice'
]

const top_of_table = $('<thead><tr>\
                        <th scope="col">Icon</th>\
                        <th scope="col">Artist</th>\
                        <th scope="col">Track</th>\
                        <th scope="col">Album</th>\
                        <th scope="col">Genre</th>\
                        <th scope="col">Currency</th>\
                        <th scope="col">Aprice</th>\
                        <th scope="col">Price</th>\
                        <th scope="col">Add</th></tr></thead>');

let body_table = $('<tbody></tbody>');


const row_results = $('#table_results');


//<th scope="row">${val.trackId}</th>\<td>${val.country}</td>\
const row_construct = function (val){
  return $(`<tr>\
            <td><img src="${val.artworkUrl60}"></td>\
            <td>${val.artistName}</td>\
            <td>${val.trackName}</td>\
            <td>${val.collectionName}</td>\
            <td>${val.primaryGenreName}</td>\     
            <td>${val.currency}</td>\
            <td>${val.collectionPrice}</td>\
            <td>${val.trackPrice}</td>\
            <td><button class="btn btn-primary btn-sm rounded-0" type="button" data-toggle="tooltip" data-placement="top" title="" data-original-title="Add">\
            <i class="fas fa-arrow-right"></i>\
            </button></td>\
            </tr>`);
}

const row_construct_playlist = function(value) {
  return $(`<tr class="added_construct">\
            <td><img src="${value.artworkUrl60}"></td>\
            <td>${value.artistName}</td>\
            <td>${value.trackName}</td>\
            <td>${value.collectionName}</td>\
            <td><audio controls src="${value.previewUrl}">Your browser does not support the<code>audio</code>element.</audio></td>\
            <td><a href="${value.trackViewUrl}" target="_blank">
                <button  class="btn btn-danger btn-sm rounded-0" type="button" data-toggle="tooltip" data-placement="top" title="" data-original-title="Delete">
                <i class="fa-solid fa-music">
                </i> </button>
                </a></td>\
            </tr>`);
}


const row_construct_added = function(value) {
  return $(`<tr class="added_construct">\
            <td><img src="${value.artworkUrl60}"></td>\
            <td>${value.artistName}</td>\
            <td>${value.trackName}</td>\
            <td>${value.collectionName}</td>\
            <td>${value.trackPrice}</td>\
            <td><button class="btn btn-danger btn-sm rounded-0" type="button" data-toggle="tooltip" data-placement="top" title="" data-original-title="Delete">\
            <i class="fa fa-trash"></i>\
            </button></td>\
            </tr>`);
}

$('#added_tracks').append('<tbody></tbody>');

const add_track = function(val){
  $('#added_tracks').children().first().append(row_construct_added(val));
}

const getPlayListHanadler = function (val) {
  let full_responce = [];
  row_results.html('');
  row_results.append(top_of_table.clone());
  row_results.append(body_table);
  body_table.html('');

  const search_request = val.split(',').join('+');
  $.get(`https://itunes.apple.com/search?media=music&term=${search_request}`)
  .then(function(all){
    full_responce = JSON.parse(all).results;
    full_responce.forEach(function(val){        
      fields.forEach(function(key,index){
        if(!val.hasOwnProperty(key) || val[key]<0) val[key]='N/A';
      });
      body_table.append(row_construct(val));
    });
  }).then(function(){
    $('.btn.btn-primary.btn-sm.rounded-0').on('click', function(event){
      to_playlist_process.push(full_responce[$(this).parent().parent().index()]);
      add_track(full_responce[$(this).parent().parent().index()]);
      $(this).parent().parent().remove();
      $('.btn.btn-danger.btn-sm.rounded-0').on('click', function(event){
        to_playlist_process.splice($(this).parent().parent().index());
        $(this).parent().parent().remove();      
      });   
    });

  }).catch(function(error){  
    console.log(error);
  });
}


//---------------------------------------------

function addSongFromField(event) {
  event.preventDefault();

  const music_field = $('#musicField').val();
  if (music_field.length>0){
    getPlayListHanadler(music_field );
  

  const info = $('#musicField').eq(0).val();

  musicInfo.push(info);
  renderList();
  $('#musicField').eq(0).val('');
  }
}

$('#addButton').click(addSongFromField);
$('#musicField').on("keypress", function (event) {
        if (event.keyCode == 13) {
            addSongFromField(event);
        }
    });

function renderList() {
  const $list = $('.info').eq(0);

  $list.empty();

  for (const info of musicInfo) {
    const $item = $('<li class="list-group-item">').text(info);

    $list.append($item)
  }
}


var triggerTabList = [].slice.call(document.querySelectorAll('#myTab a'))
triggerTabList.forEach(function (triggerEl) {
  var tabTrigger = new bootstrap.Tab(triggerEl)
  triggerEl.addEventListener('click', function (event) {
    event.preventDefault()
    tabTrigger.show()
  })
});

const tbody_playlist = $('<tbody></tbody>');
$('#getPlaylistBtn').click(function() {
  $('#spinner_loading').show();
  $('#ready_playlist_table').append(tbody_playlist);
  playlist = playlist.concat(to_playlist_process);
  let IdList = [];
  for (let track of to_playlist_process) {
    if (!IdList.includes(track.artistId)) {
      IdList.push(track.artistId);
    }
  }
  let limit = 50 / IdList.length;
  for(let id of IdList){
    $.get(`https://itunes.apple.com/lookup?id=${id}&entity=song&limit=${limit}`)
    .then(function(all){
      JSON.parse(all).results.forEach(function(val){
        playlist.push(val);
        tbody_playlist.append(row_construct_playlist(val));
        $('#spinner_loading').hide();
        $('#myTab a[href="#playlist-page"]').tab('show');
      });
    }).catch(function(err){
      console.log(err);
    });
  }
});


$(document).ready(function(){
  $('#spinner_loading').hide();
  $('#myTab a[href="#search-page"]').tab('show');
});

