// src/context/MapContext.js
import React, { createContext, useState, useContext } from 'react';

// Tạo Context
const MapContext = createContext();

// Tạo Provider
export const MapProvider = ({ children }) => {
  const [center, setCenter] = useState({ lat: 10.81993366729437,lng: 106.69843395240606  });
  const [zoomLevel, setZoomLevel] = useState(18);
  const [percentBattery, setPercentBattery] = useState(0);
  const [getPositionUser, setGetPositionUser] = useState(false);
  const [makerOpenPopup, setMakerOpenPopup] = useState({});
  const [pressPositionWarning, setPressPositionWarning] = useState(false); 
  const [pressPercentBattery, setPressPercentBattery] = useState(false); 
  const [changeNameFromMapToHeader, setChangeNameFromMapToHeader] = useState(false); 
  const [getLoggerStolen, setgetLoggerStolen] = useState(false); 
  const [displayNav, setDisplayNav] = useState(false); 
  const [displayRoutesTwoPoint, setDisplayRoutesTwoPoint] = useState(false); 
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);

  return (
    <MapContext.Provider value= {{ center, setCenter, zoomLevel, setZoomLevel, 
                                  percentBattery, setPercentBattery, getPositionUser, setGetPositionUser, 
                                  makerOpenPopup,setMakerOpenPopup, pressPositionWarning, setPressPositionWarning,
                                  changeNameFromMapToHeader, setChangeNameFromMapToHeader,
                                  pressPercentBattery, setPressPercentBattery,
                                  getLoggerStolen, setgetLoggerStolen, displayNav, setDisplayNav, displayRoutesTwoPoint, setDisplayRoutesTwoPoint,
                                  isButtonDisabled, setIsButtonDisabled                                
                                }}>
            {children}
    </MapContext.Provider>
  );
};

// Hook để sử dụng Context
export const useMapContext = () => useContext(MapContext);
