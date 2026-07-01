import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '../context/ThemeContext'

const Tab = createBottomTabNavigator()

type IoniconsName = React.ComponentProps<typeof Ionicons>['name']

const TAB_ICONS: Record<string, { active: IoniconsName; inactive: IoniconsName }> = {
  Home:      { active: 'home',          inactive: 'home-outline' },
  Exams:     { active: 'book',          inactive: 'book-outline' },
  Dashboard: { active: 'bar-chart',     inactive: 'bar-chart-outline' },
  Forum:     { active: 'chatbubbles',   inactive: 'chatbubbles-outline' },
  Profile:   { active: 'person',        inactive: 'person-outline' },
}

export default function TabNavigator() {
  const { colors } = useTheme()

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        lazy: true,
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
        tabBarIcon: ({ focused, color, size }) => {
          const icons = TAB_ICONS[route.name]
          const name = focused ? icons?.active : icons?.inactive
          return <Ionicons name={name ?? 'ellipse-outline'} size={size} color={color} />
        },
      })}>
      <Tab.Screen
        name="Home"
        getComponent={() => require('../screens/Home/HomeScreen').default}
        options={{ headerShown: false, tabBarLabel: 'Home' }}
      />
      <Tab.Screen
        name="Exams"
        getComponent={() => require('../screens/Exams/ExamsScreen').default}
        options={{ title: 'Exams', tabBarLabel: 'Exams' }}
      />
      <Tab.Screen
        name="Dashboard"
        getComponent={() => require('../screens/Dashboard/DashboardScreen').default}
        options={{ title: 'Dashboard', tabBarLabel: 'Dashboard' }}
      />
      <Tab.Screen
        name="Forum"
        getComponent={() => require('../screens/Forum/ForumScreen').default}
        options={{ title: 'Community', tabBarLabel: 'Forum' }}
      />
      <Tab.Screen
        name="Profile"
        getComponent={() => require('../screens/Profile/ProfileScreen').default}
        options={{ title: 'Profile', tabBarLabel: 'Profile' }}
      />
    </Tab.Navigator>
  )
}
