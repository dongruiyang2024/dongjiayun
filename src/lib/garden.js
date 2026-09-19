import { createContext, useContext } from 'react';
export { currentStage, projectStatuses } from '../../functions/api/_garden.js';
export const GardenContext = createContext(null);
export const useGarden = () => useContext(GardenContext);
