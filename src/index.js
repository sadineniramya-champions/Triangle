import { AppRegistry } from 'react-native-web';
import App from './App';

const appName = 'AthleteTraining';

AppRegistry.registerComponent(appName, () => App);

AppRegistry.runApplication(appName, {
  rootTag: document.getElementById('root'),
});
