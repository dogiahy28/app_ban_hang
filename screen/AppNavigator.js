import { createStackNavigator } from 'react-navigation';
import DK from './DK';
import DN from './DN';

const AppNavigator = createStackNavigator({
  DK: { screen: DK },
  DN: { screen: DN },

});

export default AppNavigator;