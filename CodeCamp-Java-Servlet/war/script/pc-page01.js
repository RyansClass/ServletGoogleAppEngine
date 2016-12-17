/**
 *
 */
/* 地図オブジェクト */
var g_Map;
/* 現在位置 */
var g_myLatlng;
/* ホスト */
//var hostname = "http://app.citrus-wus.jp";
//var hostname = "http://20150912-dot-introcat-ryans.appspot.com";
var hostname = "";

var gDebug = false;
if( location.host == "localhost:8888" ) {
	gDebug = true;
}

/**
 * ナビゲーション設定
 */
function setNavigation() {
	var navigation = responsiveNav("globalnavi", {customToggle: ".nav-toggle"});
}
/*
 * トップページ初期化
 */
function init_top() {
	/* ナビゲーション */
	setNavigation();
	$('img[usemap]').rwdImageMaps();
	$('#notfind').css('display', 'none');
	$('#shopfind').css('display', 'none');
	$('#ajaxLoader').css('display', 'none');
	$('#shopBlock').css('display', 'none');
	$('area').on('click', onClickMapArea);
	$('#word_submit').on('click', onClickWordSubmit);

}
/*
 * 地図選択ページ初期化
 */
function init_maps() {
	/* ナビゲーション */
	var navigation = responsiveNav("globalnavi", {customToggle: ".nav-toggle"});
	/* 地図の初期化 */
	map_initialize();
	var id = $("#id").attr("value");
	/* 地図マーカー */
	$.getJSON(hostname + "/NekocafeList?shop_map=all", {id : id}, markerview);
}

function onClickMapArea() {
	showLoder();
	$('#notfind').css('display', 'none');
	$('#shopfind').css('display', 'none');
	var id = $("#id").attr("value");
	$.getJSON(hostname + "/NekocafeList?shop_state=" + $(this).attr('alt'), {id : id}, setShopHeadline);
	animaScroll( "#findTop" );
}

function onClickState(num) {
	showLoder();
	$('#notfind').css('display', 'none');
	$('#shopfind').css('display', 'none');
	var id = $("#id").attr("value");
	$.getJSON(hostname + "/NekocafeList?shop_state=" + num, {id : id}, setShopHeadline);
	animaScroll( "#findTop" );
}

function onClickWordSubmit() {
	$('#notfind').css('display', 'none');
	$('#shopfind').css('display', 'none');
	var word = document.getElementById('shop_word').value;
	if (word) {
		showLoder();
		var id = $("#id").attr("value");
		$.getJSON(hostname + "/NekocafeList?shop_word=" + encodeURI(word), {id : id}, setShopHeadline);
		animaScroll( "#findTop" );
	}
}

function animaScroll( id ) {
	/* var target_offset = $( "#findTop" ).offset().top; */
	var target_offset = $( id ).offset().top;
	$('body,html').animate({scrollTop : target_offset}, 2000);
}

function showLoder() {
	var loader = $('#ajaxLoader').css('display', 'block');
}

function hidenLoder() {
	var loader = $('#ajaxLoader').css('display', 'none');
}


function setShopHeadline(datos) {
	$('#shop_list').html("");
	hidenLoder();
	if ("success" == datos.status) {
		if (0 == datos.list_size) {
			$('#notfind').css('display', 'block');
			$('#shopfind').css('display', 'none');
		} else {
			$('#notfind').css('display', 'none');
			$('#shopfind').css('display', 'block');
			$('#shopValue').html(datos.list_size);
		}
		for (var index = 0; index < datos.list_size; index++) {
			var shop = datos.list.shop[index];
			var divs = $('#shopBlock').clone(true).attr('id','shopBlock' + shop.shop_id).css('display', 'block');
			divs.find('.shop-photo').attr('src', shop.shop_photo);
			var names = divs.find('#shopName').attr('id','shopName' + shop.shop_id);
			names.attr('href', "/nekocafe.html?shop_id=" + shop.shop_id).html(shop.shop_name);
			divs.find('#shopHeadline').attr('id', 'shopHeadline' + shop.shop_id).html(shop.shop_headline);
			divs.find('#shopTel').attr('id', 'shopTel' + shop.shop_id).html(shop.shop_tel);
			divs.find('#shopAddress').attr('id', 'shopAddress' + shop.shop_id).html(shop.shop_state + shop.shop_city);
			var hp = divs.find('#shopHomepage').attr('id','shopHomepage' + shop.shop_id);
			var bg = divs.find('#shopBlog').attr('id','shopBlog' + shop.shop_id);
			var tw = divs.find('#shopTeitter').attr('id','shopTeitter' + shop.shop_id);
			var fb = divs.find('#shopFacebook').attr('id','shopFacebook' + shop.shop_id);

			hp.attr('href', shop.shop_homepage);
			if ("" == shop.shop_homepage) {
				hp.html("");
			}
			bg.attr('href', shop.shop_blog);
			if ("" == shop.shop_blog) {
				bg.html("");
			}
			tw.attr('href', shop.shop_twiter);
			if ("" == shop.shop_twiter) {
				tw.html("");
			}
			fb.attr('href', shop.shop_facebook);
			if ("" == shop.shop_facebook) {
				fb.html("");
			}
			divs.appendTo('#shop_list');
		}
	}
}
/**
 * 地図の初期化
 */
function map_initialize() {
	/* 初期表示地図の中心*/
	var myLatlng = new google.maps.LatLng(parseFloat("35.910964"), parseFloat("138.206568"));
	var mapOptions = {
		center : myLatlng,
		zoom : 5,
		mapTypeId : google.maps.MapTypeId.ROADMAP
	};
	/* マップ生成 */
	g_Map = new google.maps.Map(document.getElementById("map_canvas"),mapOptions);

	// 精度UPなし
	var position_options = { enableHighAccuracy: false };

	// 現在位置情報を取得
	navigator.geolocation.watchPosition(function(position) {
		if ( !g_myLatlng ) {
			g_myLatlng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
			g_Map.setCenter(g_myLatlng);
			g_Map.setZoom(9);
		}

	}, null, position_options);
}
/**
 * マーカーの生成
 */
function markerview(datos) {
	if ("success" == datos.status && 0 != datos.list_size) {
		// データ取得成功
		for (var index = 0; index < datos.list_size; index++) {
			var shop = datos.list.shop[index];
			var myLatlng = new google.maps.LatLng(shop.shop_latitude,
					shop.shop_longitude);
			var marker = new google.maps.Marker({
				position : myLatlng,
				map : g_Map,
				title : shop.shop_name
			});
			attachSecretMessage(marker, shop);
		}
		$("#shop_value").html(datos.list_size);
	}
}

function attachSecretMessage(marker, shop) {
	var tag = $('.map_maker').clone(true);
	tag.find('a').attr('href',"/nekocafe.html?shop_id=" + shop.shop_id);
	tag.find('a').html(shop.shop_name);
	var infowindow = new google.maps.InfoWindow({content : tag.html() });
	google.maps.event.addListener(marker, 'click', function() {
		var z = marker.get('map').getZoom()
		if (17 > z) {
			marker.get('map').setZoom(z + 2);
		}
		marker.get('map').setCenter(marker.getPosition());
		infowindow.open(marker.get('map'), marker);
	});
}


function submitContact() {
	var n = $('input[name="contact_name"]').val();
	var e = $('input[name="contact_email"]').val();
	var m = $('textarea[name="contact_message"]').val();
	var url = "/ContactForm?contact_name=" + encodeURI(n) + "&contact_email=" + encodeURI(e) + "&contact_message=" + encodeURI(m);
	var id = $("#id").attr("value");
	$('button').attr("disabled", true);
	$.getJSON(url, {id : id}).done(doneContact).fail(failContact);
	return false;
}

function doneContact(datos) {
	if ("success" == datos.status) {
		$("#contactForm").attr("class", "nonedisplay");
		$("#responsBox").attr("class", "showdisplay");
	} else {
		if (datos.errors.contact_name) {
			$("#name_error").html(datos.errors.contact_name);
		} else {
			$("#name_error").html("");
		}
		if (datos.errors.contact_email) {
			$("#email_error").html(datos.errors.contact_email);
		} else {
			$("#email_error").html("");
		}
		if (datos.errors.contact_message) {
			$("#message_error").html(datos.errors.contact_message);
		} else {
			$("#message_error").html("");
		}
		if (!datos.errors) {
			$("#responsError").attr("class", "showdisplay");
		}
	}
	$('button').attr("disabled", false);
}

function failContact(jqxhr, textStatus, error) {
	$("#contactForm").attr("class", "nonedisplay");
	$("#responsError").attr("class", "showdisplay");
}

function backAlpha() {
	var getsize = function(node) {
		return {
			dwidth : node.clientWidth,
			dheight : node.clientHeight,
			width : node.scrollWidth,
			height : node.scrollHeight
		};
	};
	var wsize = getsize(document.documentElement);
	var frame = document.body.appendChild(document.createElement("div"));
	frame.id = "backAlpha";
	if (frame.style.setExpression) { // IE
		frame.style.position = "absolute";
		frame.style.setExpression('top','y=(document.documentElement.scrollTop)+"px"');
		frame.style.setExpression('left','x=(document.documentElement.scrollLeft)+"px"');
	} else {
		frame.style.position = "fixed";
	}
	frame.style.left = "0px";
	frame.style.top = "0px";
	frame.style.width = wsize.dwidth + "px";
	frame.style.height = wsize.dheight + "px";
	frame.style.backgroundColor = "gray";
	frame.style.opacity = 0.5;
	frame.style.filter = "alpha(opacity=50)";
	frame.style.pointerEvents = "none";
	frame.style.zIndex = 999;
	frame.onclick = function() {
		return false;
	};
	window.onresize = function() {
		var wsize = getsize(document.documentElement);
		frame.style.width = wsize.dwidth + "px";
		frame.style.height = wsize.dheight + "px";
	};
}

function closeBackAlpha() {
	var backAlpha = document.getElementById("backAlpha");
	if (backAlpha) {
		$('#backAlpha').fadeOut( 1000, function(){
			document.body.removeChild(backAlpha);
		});
	}
}

function showMessageBox(message) {
	backAlpha();
	var popup = document.getElementById("popupMessageBox");
	var mElement = document.getElementById("popupMessageBox_message");
	/* フレーム（親）の設定 */
	var baseWidth = 280;
	var baseHeight = 480;
	popup.style.display = "block";
	popup.style.width = baseWidth + "px";
	popup.style.top = ((window.innerHeight - baseHeight) / 2) + "px";
	popup.style.left = (($(window).width() - baseWidth) / 2) + "px";
	popup.style.position = "fixed";
	popup.style.zIndex = "2";
	mElement.innerHTML = message;
	return false;
}

function closeMessageBox() {
	var box = document.getElementById("popupMessageBox");
	if (box) {
		box.style.display = "none";
	}
	closeBackAlpha();
}

function nekocafeLogin( id ) {
	var form = document.getElementById( id );

	if ( "" == form.shop_id.value || "" == form.shop_pass.value ) {
		return false;
	}
	var form_data = new FormData( form );

	var host = form.action;

	backAlpha()

	$.ajax({
		url: host,
		type: form.method,
		data: form_data,
		dataType : 'json',
		processData: false,
		contentType: false,
		success: function( datos ) {
			if ( "success" == datos.status ) {
				var janp = datos.url;
				if ( gDebug ) {
					janp = datos.url.replace("https:","http:");
				}
				location.href = janp;
			} else {
				if ( "" != datos.url ) {
					location.href = datos.url;
				} else {
					$('#loginError').css('display','inline');
					$('#loginError').html( datos.message );
				}
				closeBackAlpha();
			}
		},
		error: function( jqxhr, textStatus, error ) {
			$('#loginError').css('display','inline');
			closeBackAlpha();
		}
	});
}

