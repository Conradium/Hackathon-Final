interface DeviceOrientationEventiOS extends DeviceOrientationEvent {
    requestPermission?: () => Promise<PermissionState>
  }
  
  interface DeviceOrientationEventStatic extends EventTarget {
    requestPermission?: () => Promise<PermissionState>
  }
  
  