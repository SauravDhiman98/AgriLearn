import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { useTranslation } from 'react-i18next'
import HomeScreen from '../screens/Home/HomeScreen'
import CoursesScreen from '../screens/Courses/CoursesScreen'
import ForumScreen from '../screens/Forum/ForumScreen'
import MarketplaceScreen from '../screens/Marketplace/MarketplaceScreen'
import ProfileScreen from '../screens/Profile/ProfileScreen'
import { useTheme } from '../context/ThemeContext'

const Tab = createBottomTabNavigator()

export default function TabNavigator() {
  const { t } = useTranslation()
  const { colors } = useTheme()

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.tabBar,
          borderTopColor: colors.tabBarBorder,
          borderTopWidth: 1,
          paddingBottom: 4,
        },
        headerStyle: { backgroundColor: colors.header },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' },
      }}>
      <Tab.Screen name="Home" component={HomeScreen}
        options={{ title: 'Tassy Point', tabBarLabel: 'Home' }} />
      <Tab.Screen name="Courses" component={CoursesScreen}
        options={{ title: 'Courses', tabBarLabel: 'Courses' }} />
      <Tab.Screen name="Forum" component={ForumScreen}
        options={{ title: 'Community', tabBarLabel: 'Forum' }} />
      <Tab.Screen name="Marketplace" component={MarketplaceScreen}
        options={{ title: 'Marketplace', tabBarLabel: 'Market' }} />
      <Tab.Screen name="Profile" component={ProfileScreen}
        options={{ title: 'Profile', tabBarLabel: 'Profile' }} />
    </Tab.Navigator>
  )
}
