import './App.scss';
import React, { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvent   } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from 'leaflet'
import "leaflet/dist/leaflet.css";
import * as signalR from "@microsoft/signalr";
import ChangeName from './ChangeName';
import axios from 'axios';
import { ToastContainer } from 'react-toastify';
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import "leaflet-routing-machine";
import './Map.scss'
import useGeoLocation from "./useGeoLocation"
import {  toast } from 'react-toastify';
import ModelConfirm from './ModelConfirm';
import { useMapContext } from './MapContext';
function Map() {
  const { center, zoomLevel, setZoomLevel,
          percentBattery, getPositionUser, setCenter,
          makerOpenPopup, pressPositionWarning, 
          setChangeNameFromMapToHeader, setMakerOpenPopup,
          pressPercentBattery, setgetLoggerStolen, displayNav, setDisplayNav, displayRoutesTwoPoint, setDisplayRoutesTwoPoint,
          isButtonDisabled, setIsButtonDisabled     
        } = useMapContext();      
  const locationUser = useGeoLocation()  // lấy vị trí của người thay pin
  const [showModalChangeName, setshowModalChangeName] = useState(false); // hiển thị bảng đổi tên
  const [ZOOM_LEVEL, setZOOM_LEVEL] = useState(9) // độ zoom map
  const [listAllLogger, setListAllLogger]= useState([]) // danh sách tất cả logger
  const mapRef = useRef()  
  const [positionUser, setpositionUser] = useState({ latitude: "", longtitude: "" }); //vị trí của người thay pin    
  const [isShowPositionUser, setIsShowPositionUser] = useState(false); // hiển thị vị trí người thay pin
  const [listLoggerBattery,setlistLoggerBattery] = useState([]) // danh sách Logger cần thay pin
  const [listLoggerStolen,setlistLoggerStolen] = useState([]) // danh sách Logger bị trộm
  const [dataLoggerEdit,setdataLoggerEdit] = useState({}) // chọn dataLogger cần sửa tên
  const [isDisplayPositionCabinet, setIsDisplayPositionCabinet] = useState(false);  // hiển thị tủ điện
  const [PositionCabinet, setPositionCabinet] = useState({});  // hiển thị tủ điện
  
  const url = 'https://sawacoapi.azurewebsites.net'
  
  const wakeup = new L.Icon({ // marker bình thường
    iconUrl: require("./asset/images/position.png" ),
    iconSize: [40,52],  
    iconAnchor: [17, 49],     // nhỏ thì sang phải, xuống  
    popupAnchor: [3, -45],   // nhỏ thì sang trái  
  })
  
  const warning = new L.Icon({  // marker bị trộm
    iconUrl: require("./asset/images/warning.png" ),
    iconSize: [50,55],
    iconAnchor: [28, 50],    // nhỏ thì sang phải, xuống         
    popupAnchor: [4, -45], 
  })

  const warning2 = new L.Icon({  // marker bị trộm
    iconUrl: require("./asset/images/warning.png" ),                          
    iconSize: [50,55],
    iconAnchor: [28, 50],    // nhỏ thì sang phải, xuống       
    popupAnchor: [4, -45], 
  })

  const user = new L.Icon({  // vị trí người thay pin
    iconUrl: require("./asset/images/maker_user.png" ),
    iconSize: [60,60],
    iconAnchor: [25, 50],
    popupAnchor: [6, -40], 
  })

  const battery = new L.Icon({  // vị trí những DataLogger có mức pin cần thay
    iconUrl: require("./asset/images/battery.png" ),
    iconSize: [65,60],
    iconAnchor: [30, 53], // nhỏ thì sang phải, xuống
    popupAnchor: [3, -46], 
  })
  const cabinet = new L.Icon({  // vị trí những DataLogger có mức pin cần thay
    iconUrl: require("./asset/images/cabinet.png" ),
    iconSize: [45,40],
    iconAnchor: [30, 45], // nhỏ thì sang phải, xuống
    popupAnchor: [-5, -40],  // nhỏ thì sang trái 
  })

  const ListPositionCabinet = [
      {
        id:'c01b',
        lat: 10.800974795749196,
        lng: 106.66646797261595,
        name: 'TH1033'
      },
      {
        id:'c02b',
        lat: 10.767749504257756,
        lng: 106.6675199436147,
        name: 'PT1006'
      }

  ]

const getLogger = async () => {
  let success = false;
  while (!success) {
    try {
      const response = await axios.get(`${url}/Logger/GetAllLoggers`);
      const LoggerData = response.data;

      // Kiểm tra nếu dữ liệu nhận được hợp lệ
      if (LoggerData && LoggerData.length > 0) {
        setListAllLogger(LoggerData);

        const ListStolen = LoggerData.filter((item) => item.stolen === true);
        setlistLoggerStolen(ListStolen);


        success = true; // Dừng vòng lặp khi dữ liệu hợp lệ và được xử lý
      } else {
        alert('ReLoad');
      }
    } catch (error) {
      console.error('Get All Logger error, retrying...', error);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Đợi 2 giây trước khi thử lại
    }
  }
};

useEffect(() => {
  getLogger();
}, []);


useEffect(() => {  
  if(listLoggerStolen.length > 0){

    setgetLoggerStolen(true)
    if(makerOpenPopup.id){
      const LoggerOpenPopup = listLoggerStolen.find((item,index) => item.id === makerOpenPopup.id )
      setMakerOpenPopup(LoggerOpenPopup) 
    }
  }
}, [listLoggerStolen])

 

useEffect(()=>{
  if( percentBattery > 0 ) {   
    const  listDataLoggerBattery = listAllLogger.filter((item,index)=> item.battery <= parseInt(percentBattery) )            
    if(listDataLoggerBattery.length > 0  ){
      setlistLoggerBattery(listDataLoggerBattery)
      setCenter({ lat: 10.81993366729437, lng: 106.69843395240606  })
      setZoomLevel(9)
    }   
    else{
      setIsShowPositionUser(false)
      setlistLoggerBattery([]) 
      toast.error('Không có mức pin cần thay') 
    }           
}
},[pressPercentBattery])
   
 

useEffect( () => {
  let connection = new signalR.HubConnectionBuilder()   
      .withUrl("https://sawacoapi.azurewebsites.net/NotificationHub")   
      .withAutomaticReconnect()    
      .build();     
  // Bắt đầu kết nối   
  connection.start()   
      .then(() => {
          console.log('Kết nối thành công!');
      })
      .catch(err => {
          console.error('Kết nối thất bại: ', err);
      });
  // Lắng nghe sự kiện kết nối lại
  connection.onreconnected(connectionId => {
      console.log(`Kết nối lại thành công. Connection ID: ${connectionId}`);
  });
  // Lắng nghe sự kiện đang kết nối lại
  connection.onreconnecting(error => {
      console.warn('Kết nối đang được thử lại...', error);
  });
  connection.on("GetAll", data => {   
        const obj = JSON.parse(data);
        getLogger()                 
  });                      
}, [] )
                                                       
const handleMapClickGetLocation = (e) => {  // lấy tọa độ khi Click vô Map
  console.log('lat: '+ e.latlng.lat)
  console.log('lng: '+ e.latlng.lng)
};

useEffect(() => { // Cập nhật bản đồ với giá trị mới của center và ZOOM_LEVEL
  if (mapRef.current) {
        mapRef.current.setView(center, zoomLevel);
  }
}, [center,zoomLevel]);    

const handleshowModalChangeName= (item) => {
      setshowModalChangeName(true)  // hiển thị bảng đổi tên
      setdataLoggerEdit(item)  
      setDisplayNav(false)
      
}

const handleCloseModalChangeName =() => { // đóng bảng đổi tên
      setshowModalChangeName(false)
      getLogger()
      setChangeNameFromMapToHeader(pre=>!pre)
}

// useEffect(() => {  // Dẫn đường từ vị trí người thay pin qua tất cả vị trí có mức pin cần thay
  
//   RemoveRouteBattery()
  
//   if(listLoggerBattery.length > 0 ){

//     const calculateDistance = (point1, point2) => {
//       const latLng1 = L.latLng(point1.latitude, point1.longtitude);
//       const latLng2 = L.latLng(point2.latitude, point2.longtitude);
//       const distance = latLng1.distanceTo(latLng2);
      
//       return distance;
//     };
    
//     const findNearestNeighbor = (graph, visited, currPos, n) => {
//       let minDistance = Infinity;
//       let nearestNeighbor = -1;
    
//       for (let i = 0; i < n; i++) {
//         if (!visited[i] && graph[currPos][i] && graph[currPos][i] < minDistance) {
//           minDistance = graph[currPos][i];
//           nearestNeighbor = i;
//         }
//       }
//       return nearestNeighbor;
//     };
    
//     const sortCitiesByNearestNeighbor = (locations, startIdx) => {
//       const n = locations.length;
//       const graph = Array.from({ length: n }, () => Array(n).fill(0));
    
//       locations.forEach((loc, idx) => {
//         locations.forEach((otherLoc, otherIdx) => {
//           if (idx !== otherIdx) {
//             graph[idx][otherIdx] = calculateDistance(loc, otherLoc);
//           }
//         });
//       });
    
//       const visited = Array(n).fill(false);
//       const sortedCities = [];
    
//       let currPos = startIdx;
//       sortedCities.push(locations[currPos]);
//       visited[currPos] = true;
    
//       for (let count = 1; count < n; count++) {
//         const nearestNeighbor = findNearestNeighbor(graph, visited, currPos, n);
//         if (nearestNeighbor !== -1) {
//           sortedCities.push(locations[nearestNeighbor]);
//           visited[nearestNeighbor] = true;
//           currPos = nearestNeighbor;
//         }
//       }
//       return sortedCities;
//     };
    
    const currentRoutingRef = useRef(null);
    const handleDisplayRoute = async () => {
      
      
      
      
          RemoveRoute();  // Xóa tuyến đường trước đó nếu có
      // }
      
      try {
        if (!mapRef.current) {
          console.error("Map object is not available.");
          return;
        }
    
        const routing = L.Routing.control({
          waypoints: [
            L.latLng(makerOpenPopup.latitude, makerOpenPopup.longtitude),
            L.latLng(PositionCabinet.lat, PositionCabinet.lng)
          ],
          lineOptions: {
            styles: [
              {
                color: "blue",
                opacity: 1,
                weight: 8
              }
            ]
          },
          routeWhileDragging: true,
          addWaypoints: false,
          draggableWaypoints: true,
          fitSelectedRoutes: false,
          showAlternatives: false,
          show: false,
          createMarker: function() { return null; }
        });
    
        currentRoutingRef.current = routing;
        routing.addTo(mapRef.current);
      } catch (error) {
        console.error('Error displaying route:', error);
      } 
    };
    
    

    const RemoveRoute = () => {   
      if (currentRoutingRef.current) {
        try {
          if (mapRef.current && currentRoutingRef.current) {
              currentRoutingRef.current.remove();  // Xóa tuyến đường khỏi bản đồ
          }
          currentRoutingRef.current = null;
        } catch (error) {
          console.error("Error removing route:", error);
        }
      }
    };
    
    

  useEffect(() => {
    if(PositionCabinet.lat > 0 ){
        handleDisplayRoute()
    }
    
  },[PositionCabinet])


   

function convertDateTime(inputString) {
  const [date, time] = inputString.split('T');
  const [year, month, day] = date.split('-');    
  return `${day}-${month}-${year} ${time}`;       
}
 
  const markerRef = useRef();
  const [isDisplayMakerOpenPopup, setIsDisplayMakerOpenPopup ] = useState(false)
  
  useEffect(() => {
    if(makerOpenPopup.latitude > 0){
      setIsDisplayMakerOpenPopup(true)
      if (markerRef.current) {
           markerRef.current.openPopup(); // Mở popup sau khi marker được render
           
           if(makerOpenPopup.id === 'c01b'){

            setPositionCabinet({lat: ListPositionCabinet[0].lat , lng: ListPositionCabinet[0].lng , name : ListPositionCabinet[0].name  })
            setIsDisplayPositionCabinet(true)
           }
           if(makerOpenPopup.id === 'c02b'){
            setPositionCabinet({lat: ListPositionCabinet[1].lat , lng: ListPositionCabinet[1].lng , name : ListPositionCabinet[1].name})
            setIsDisplayPositionCabinet(true)
           }

          
      }
    }
  }, [isDisplayMakerOpenPopup, pressPositionWarning]);  

  return (
    <>
 <div className='Map'>
                  <div className='divMap'>                   
                    <MapContainer 
                          center={center} 
                          zoom={ZOOM_LEVEL}     
                          ref={mapRef}>
                        <TileLayer
                             attribution ='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                             url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"                            
                        />
                        <MyClickHandlerGetLocation onClick={handleMapClickGetLocation}/>                                                       
              
                            {isDisplayMakerOpenPopup && <Marker 
                                      className = 'maker'
                                      position = {[makerOpenPopup.latitude, makerOpenPopup.longtitude]}
                                      icon= { warning2 } 
                                      zIndexOffset = {3000}
                                      ref = {markerRef}                                                                
                                  >
                                     <Popup  >
                                        <div className='div-popup'>
                                          <div className='infor'>
                                            <div className ='inforItem'>   
                                                <div className='title'>Tên:</div>
                                                                                               
                                                <div className='value'>{listLoggerStolen.find((item,index) => item.id === makerOpenPopup.id ).name}</div>
                                            </div>    
                                            <div className ='inforItem'>
                                                <div className='title'>Mức pin:</div>
                                                <div className='value'>{`${makerOpenPopup.battery}%`}</div>
                                            </div> 
                                            <div className ='inforItem'>
                                                <div className='title'>Kinh độ:</div>
                                                <div className='value'>{Math.round(makerOpenPopup.latitude * 10000) / 10000}</div>
                                            </div>  
                                            <div className ='inforItem'>
                                                <div className='title'>Vĩ độ:</div>
                                                <div className='value'>{Math.round(makerOpenPopup.longtitude * 10000) / 10000}</div>
                                            </div>
                                            <div className ='inforItem'>
                                                <div className='title'>Nhiệt độ:</div>
                                                <div className='value'>{`${makerOpenPopup.temperature} độ C`}</div>
                                            </div>
                                            <div className ='inforItem'>
                                                <div className='title'>Thời điểm gần nhất:</div>
                                                <div className='value'>{convertDateTime(makerOpenPopup.timeStamp)}</div>      
                                            </div>
                                           
                                          </div>
                                              
                                                                                                 
                                            <div className='button'>
                                              <button type="button" class="btn btn-primary" data-mdb-ripple-init
                                                     onClick={()=>handleshowModalChangeName(listLoggerStolen.find((item,index) => item.id === makerOpenPopup.id ))}
                                              >Đổi tên</button>
                                            </div>                                  
                                        </div>                                                                             
                                    </Popup>     
                                </Marker>}
                                
                                
                                {listAllLogger.map((item,index)=>(
                                  <Marker 
                                      className='maker'
                                      position={[item.latitude , item.longtitude]}
                                      icon= { wakeup } 
                                      key={index}                               
                                  >
                                     <Popup  >
                                        <div className='div-popup'>
                                          <div className='infor'>
                                            <div className ='inforItem'>   
                                                <div className='title'>Tên:</div>
                                                <div className='value'>{item.name}</div>
                                            </div>    
                                            <div className ='inforItem'>
                                                <div className='title'>Mức pin:</div>
                                                <div className='value'>{`${item.battery}%`}</div>
                                            </div> 
                                            <div className ='inforItem'>
                                                <div className='title'>Kinh độ:</div>
                                                <div className='value'>{Math.round(item.latitude * 10000) / 10000}</div>
                                            </div>  
                                            <div className ='inforItem'>
                                                <div className='title'>Vĩ độ:</div>
                                                <div className='value'>{Math.round(item.longtitude * 10000) / 10000}</div>
                                            </div>
                                            <div className ='inforItem'>
                                                <div className='title'>Nhiệt độ:</div>
                                                <div className='value'>{`${item.temperature} độ C`}</div>
                                            </div>
                                            <div className ='inforItem'>
                                                <div className='title'>Thời điểm gần nhất:</div>
                                                <div className='value'>{convertDateTime(item.timeStamp)}</div>      
                                            </div>
                                           
                                          </div>
                                              
                                                                                                 
                                            <div className='button'>
                                              <button type="button" class="btn btn-primary" data-mdb-ripple-init
                                                     onClick={()=>handleshowModalChangeName(item)}
                                              >Đổi tên</button>
                                            </div>                                  
                                        </div>                                                                             
                                    </Popup>     
                                </Marker>
                                ))}

                                {listLoggerStolen.length > 0 && listLoggerStolen.map((item,index)=>(
                                  <Marker 
                                      className='maker'    
                                      position={[item.latitude , item.longtitude]}
                                      icon= { warning } 
                                      key={index}
                                      zIndexOffset={  1000 }                  
                                  >
                                    <Popup>
                                        <div className='div-popup'>
                                          <div className='infor'>
                                            <div className ='inforItem'>   
                                                <div className='title'>Tên:</div>
                                                <div className='value'>{item.name}</div>
                                            </div>    
                                            <div className ='inforItem'>
                                                <div className='title'>Mức pin:</div>
                                                <div className='value'>{`${item.battery}%`}</div>
                                            </div> 
                                            <div className ='inforItem'>
                                                <div className='title'>Kinh độ:</div>
                                                <div className='value'>{Math.round(item.latitude * 10000) / 10000}</div>
                                            </div>  
                                            <div className ='inforItem'>
                                                <div className='title'>Vĩ độ:</div>
                                                <div className='value'>{Math.round(item.longtitude * 10000) / 10000}</div>
                                            </div>
                                            <div className ='inforItem'>
                                                <div className='title'>Nhiệt độ:</div>
                                                <div className='value'>{`${item.temperature} độ C`}</div>
                                            </div>
                                            <div className ='inforItem'>
                                                <div className='title'>Thời điểm gần nhất:</div>
                                                <div className='value'>{convertDateTime(item.timeStamp)}</div>    
                                            </div>          
                                              
                                          </div>
                                              
                                                                                                 
                                            <div className='button'>
                                              <button type="button" class="btn btn-primary" data-mdb-ripple-init
                                                     onClick={()=>handleshowModalChangeName(item)}
                                              >Đổi tên</button>
                                            </div>                                  
                                        </div>                                                                             
                                    </Popup>      
                                </Marker>
                                ))}
                          
                               
                                
                                {isShowPositionUser && 
                                  <Marker 
                                      className='maker'
                                      // position={[positionUser.latitude , positionUser.longtitude]}
                                      position={[locationUser.coordinates.latitude, locationUser.coordinates.longtitude]}
                                      icon= { user }                             
                                  >
                                  </Marker>
                                }

                                {isDisplayPositionCabinet && 
                                  <Marker 
                                      className='maker'
                                      position={[PositionCabinet.lat, PositionCabinet.lng]}
                                      icon= { cabinet }  
                                      zIndexOffset = {2999}                           
                                  >
                                        <Popup>
                                        <div className='div-popup'>
                                                      <div>{PositionCabinet.name}</div>                           
                                        </div>                                                                             
                                    </Popup>     
                                  </Marker>
                                }
                                 
                                {listLoggerBattery.length > 0 &&  listLoggerBattery.map((item,index)=>(
                                  <Marker 
                                      className='maker'
                                      position={[item.latitude , item.longtitude]}
                                      icon= { battery } 
                                      key={index}   
                                      zIndexOffset={  4000 }                             
                                  >
                                       <Popup>
                                        <div className='div-popup'>
                                          <div className='infor'>
                                            <div className ='inforItem'>   
                                                <div className='title'>Tên:</div>
                                                <div className='value'>{item.name}</div>
                                            </div>    
                                            <div className ='inforItem'>
                                                <div className='title'>Mức pin:</div>
                                                <div className='value'>{`${item.battery}%`}</div>
                                            </div> 
                                            <div className ='inforItem'>
                                                <div className='title'>Kinh độ:</div>
                                                <div className='value'>{Math.round(item.latitude * 10000) / 10000}</div>
                                            </div>  
                                            <div className ='inforItem'>
                                                <div className='title'>Vĩ độ:</div>
                                                <div className='value'>{Math.round(item.longtitude * 10000) / 10000}</div>
                                            </div>
                                            
                                          </div>
                                              
                                                                                                 
                                            <div className='button'>
                                              <button type="button" class="btn btn-primary" data-mdb-ripple-init
                                                     onClick={()=>handleshowModalChangeName(item)}
                                              >Đổi tên</button>   
                                            </div>                                  
                                        </div>                                                                             
                                    </Popup>  
                                      
                                </Marker>  
                                ))}                                                      
                    </MapContainer>
                  </div>
                 
                  <ToastContainer
                        position="top-right"
                        autoClose={5000}
                        hideProgressBar={false}
                        newestOnTop={false}
                        closeOnClick
                        rtl={false}
                        pauseOnFocusLoss
                        draggable
                        pauseOnHover
                        theme="light"
                        containerId="Map"    
                     />
                    
    </div>
                    <ChangeName
                           show={showModalChangeName} 
                           handleClose={handleCloseModalChangeName}   
                           dataLoggerEdit={dataLoggerEdit}                     
                    />     
                    {/* <ModelConfirm
                           show={showModalConfirmDeleteGPS} 
                           handleClose={handleCloseModalConfirmDeleteGPS}   
                           dataLoggerLineStolen={dataLoggerLineStolen}                     
                    />      */}

    </>
   
  );  
}
function MyClickHandlerGetLocation({ onClick }) {
  const map = useMapEvent('click', (e) => {
    onClick(e);
  });
  
  return null;
  }    
export default Map;