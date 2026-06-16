import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { useSelector } from 'react-redux'
import { RootState } from '../store'
import TabNavigator from './TabNavigator'
import LoginScreen from '../screens/Auth/LoginScreen'
import RegisterScreen from '../screens/Auth/RegisterScreen'
import CourseDetailScreen from '../screens/Courses/CourseDetailScreen'
import LessonScreen from '../screens/Courses/LessonScreen'
import ForumPostScreen from '../screens/Forum/ForumPostScreen'
import ProductDetailScreen from '../screens/Marketplace/ProductDetailScreen'
import LiveClassScreen from '../screens/LiveClasses/LiveClassScreen'

export type RootStackParamList = {
  Tabs: undefined
  Login: undefined
  Register: undefined
  CourseDetail: { courseId: number }
  Lesson: { courseId: number; lessonId: number }
  ForumPost: { postId: number }
  ProductDetail: { productId: number }
  LiveClass: { classId: number }
}

const Stack = createNativeStackNavigator<RootStackParamList>()

export default function RootNavigator() {
  const { isAuthenticated } = useSelector((s: RootState) => s.auth)

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Tabs" component={TabNavigator} />
      <Stack.Screen name="Login" component={LoginScreen}
        options={{ headerShown: true, title: 'Login', headerTintColor: '#16a34a' }} />
      <Stack.Screen name="Register" component={RegisterScreen}
        options={{ headerShown: true, title: 'Create Account', headerTintColor: '#16a34a' }} />
      <Stack.Screen name="CourseDetail" component={CourseDetailScreen}
        options={{ headerShown: true, title: 'Course', headerTintColor: '#16a34a' }} />
      <Stack.Screen name="Lesson" component={LessonScreen}
        options={{ headerShown: true, headerTintColor: '#16a34a' }} />
      <Stack.Screen name="ForumPost" component={ForumPostScreen}
        options={{ headerShown: true, title: 'Forum', headerTintColor: '#16a34a' }} />
      <Stack.Screen name="ProductDetail" component={ProductDetailScreen}
        options={{ headerShown: true, title: 'Product', headerTintColor: '#16a34a' }} />
      <Stack.Screen name="LiveClass" component={LiveClassScreen}
        options={{ headerShown: true, title: 'Live Class', headerTintColor: '#16a34a' }} />
    </Stack.Navigator>
  )
}
