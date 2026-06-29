import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import Ionicons from '@expo/vector-icons/Ionicons'
import HomeScreen from '../screens/Home/HomeScreen'
import ExamsScreen from '../screens/Exams/ExamsScreen'
import DashboardScreen from '../screens/Dashboard/DashboardScreen'
import ForumScreen from '../screens/Forum/ForumScreen'
import ProfileScreen from '../screens/Profile/ProfileScreen'
import { useTheme } from '../context/ThemeContext'

const Tab = createBottomTabNavigator()

export default function TabNavigator() {
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
        options={{
          title: 'Tassy Point',
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }) => <Ionicons name="home-outline" size={size} color={color} />,
        }} />
      <Tab.Screen name="Exams" component={ExamsScreen}
        options={{
          title: 'Exams',
          tabBarLabel: 'Exams',
          tabBarIcon: ({ color, size }) => <Ionicons name="book-outline" size={size} color={color} />,
        }} />
      <Tab.Screen name="Dashboard" component={DashboardScreen}
        options={{
          title: 'Dashboard',
          tabBarLabel: 'Dashboard',
          tabBarIcon: ({ color, size }) => <Ionicons name="grid-outline" size={size} color={color} />,
        }} />
      <Tab.Screen name="Forum" component={ForumScreen}
        options={{
          title: 'Community',
          tabBarLabel: 'Forum',
          tabBarIcon: ({ color, size }) => <Ionicons name="chatbubbles-outline" size={size} color={color} />,
        }} />
      <Tab.Screen name="Profile" component={ProfileScreen}
        options={{
          title: 'Profile',
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, size }) => <Ionicons name="person-outline" size={size} color={color} />,
        }} />
    </Tab.Navigator>
  )
}
