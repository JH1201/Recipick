var container = document.getElementById('map');
var options = {
    center: new kakao.maps.LatLng(37.4967, 127.0630),
    level: 8
};

var map = new kakao.maps.Map(container, options);

init('/recipick/polygon');

// HTML5의 geolocation으로 사용자 위치를 얻어 지도 중심을 변경합니다
if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
        var lat = position.coords.latitude, // 위도
            lon = position.coords.longitude; // 경도

        var locPosition = new kakao.maps.LatLng(lat, lon), // 마커가 표시될 위치를 geolocation으로 얻어온 좌표로 생성합니다
            message = '<div style="padding:5px;">여기에 계신가요?!</div>'; // 인포윈도우에 표시될 내용입니다

        // 마커와 인포윈도우를 표시합니다
        displayMarker(locPosition, message);
    });
}
else { // HTML5의 GeoLocation을 사용할 수 없을때 마커 표시 위치와 인포윈도우 내용을 설정합니다

    var locPosition = new kakao.maps.LatLng(33.450701, 126.570667),
        message = 'geolocation을 사용할수 없어요..'

    displayMarker(locPosition, message);
}

// 지도에 마커와 인포윈도우를 표시하는 함수입니다
function displayMarker(locPosition, message) {
    var marker = new kakao.maps.Marker({
        map: map,
        position: locPosition
    });

    var iwContent = message, // 인포윈도우에 표시할 내용
        iwRemoveable = true;

    var infowindow = new kakao.maps.InfoWindow({
        content : iwContent,
        removable : iwRemoveable
    });

    infowindow.open(map, marker);
    map.setCenter(locPosition);
}

function sendLocation() {
    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(function(position) {
            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;

            fetch('/location', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ latitude: latitude, longitude: longitude })
            })
            .then(response => response.text())
            .then(data => console.log('Success:', data))
            .catch((error) => console.error('Error:', error));
        });
    } else {
        alert("Geolocation is not supported by this browser.");
    }
}

function init(path) {
    fetch(path)
        .then(function (response) {
            return response.json();
        })
        .then(function (geojson) {
            polygons = [];

            // 지오메트리 데이터를 기반으로 폴리곤을 생성합니다.
            geojson.features.forEach(function (feature) {
                var paths = [];
                if (feature.geometry.type === 'Polygon') {
                    // 단일 폴리곤 처리
                    paths = feature.geometry.coordinates.map(function (ring) {
                        return ring.map(function (coord) {
                            return new kakao.maps.LatLng(coord[1], coord[0]);
                        });
                    });
                } else if (feature.geometry.type === 'MultiPolygon') {
                    // 멀티폴리곤 처리
                    feature.geometry.coordinates.forEach(function (polygon) {
                        var polygonPath = polygon.map(function (ring) {
                            return ring.map(function (coord) {
                                return new kakao.maps.LatLng(coord[1], coord[0]);
                            });
                        });
                        paths.push(polygonPath);
                    });
                }

                // 폴리곤을 생성하고 이벤트를 설정합니다.
                paths.forEach(function (path) {
                    var polygon = new kakao.maps.Polygon({
                        map: map,
                        path: path,
                        strokeWeight: 1,
                        strokeColor: '#004c80',
                        strokeOpacity: 0.8,
                        fillColor: '#fff',
                        fillOpacity: 0.7
                    });

                    // 마우스 오버 시 폴리곤의 색상을 변경합니다.
                    kakao.maps.event.addListener(polygon, 'mouseover', function () {
                        polygon.setOptions({ fillColor: '#09f' });
                    });

                    // 마우스 아웃 시 폴리곤의 색상을 원래대로 변경합니다.
                    kakao.maps.event.addListener(polygon, 'mouseout', function () {
                        polygon.setOptions({ fillColor: '#fff' });
                    });

                    // 폴리곤 클릭 시 동작 작성.
                    kakao.maps.event.addListener(polygon, 'click', function () {

                    });

                    polygons.push(polygon);
                });
            });
        })
        .catch(error => console.error('GeoJSON 데이터 로드 실패:', error));
}

function removePolygons() {
// 모든 폴리곤을 지도에서 제거하고 배열을 초기화합니다.
polygons.forEach(function (polygon) {
    polygon.setMap(null);
});
polygons = [];
console.log("폴리곤 제거 완료");
}
