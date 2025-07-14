import { createNavigationContainerRef } from '@react-navigation/native';
import { RootStackParamList } from '../types/navigation'; // o donde hayas definido el tipo

export const navigationRef = createNavigationContainerRef<RootStackParamList>();

