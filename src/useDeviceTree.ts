import { useContext } from 'react';
import { DeviceTreeContext, DeviceTreeState } from './context';

export function useDeviceTree(): DeviceTreeState {
    return useContext(DeviceTreeContext);
}
