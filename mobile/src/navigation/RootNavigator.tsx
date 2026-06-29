import { createNativeStackNavigator } from '@react-navigation/native-stack'
import TabNavigator from './TabNavigator'
import LoginScreen from '../screens/Auth/LoginScreen'
import RegisterScreen from '../screens/Auth/RegisterScreen'
import ForgotPasswordScreen from '../screens/Auth/ForgotPasswordScreen'
import CoursesScreen from '../screens/Courses/CoursesScreen'
import CourseDetailScreen from '../screens/Courses/CourseDetailScreen'
import LessonScreen from '../screens/Courses/LessonScreen'
import ExamDetailScreen from '../screens/Exams/ExamDetailScreen'
import MockTestScreen from '../screens/Exams/MockTestScreen'
import DashboardScreen from '../screens/Dashboard/DashboardScreen'
import ForumPostScreen from '../screens/Forum/ForumPostScreen'
import ProductDetailScreen from '../screens/Marketplace/ProductDetailScreen'
import LiveClassScreen from '../screens/LiveClasses/LiveClassScreen'

export type RootStackParamList = {
  Tabs: undefined
  Login: undefined
  Register: undefined
  ForgotPassword: undefined
  Courses: undefined
  Dashboard: undefined
  CourseDetail: { courseId: number }
  Lesson: { courseId: number; lessonId: number }
  ExamDetail: { examId: number }
  MockTest: { testId: number }
  ForumPost: { postId: number }
  ProductDetail: { productId: number }
  LiveClass: { classId: number }
}

const Stack = createNativeStackNavigator<RootStackParamList>()

export default function RootNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Tabs" component={TabNavigator} />
      <Stack.Screen name="Login" component={LoginScreen}
        options={{ headerShown: true, title: 'Login', headerTintColor: '#16a34a' }} />
      <Stack.Screen name="Register" component={RegisterScreen}
        options={{ headerShown: true, title: 'Create Account', headerTintColor: '#16a34a' }} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen}
        options={{ headerShown: true, title: 'Forgot Password', headerTintColor: '#16a34a' }} />
      <Stack.Screen name="Courses" component={CoursesScreen}
        options={{ headerShown: true, title: 'Courses', headerTintColor: '#16a34a' }} />
      <Stack.Screen name="Dashboard" component={DashboardScreen}
        options={{ headerShown: true, title: 'Dashboard', headerTintColor: '#16a34a' }} />
      <Stack.Screen name="CourseDetail" component={CourseDetailScreen}
        options={{ headerShown: true, title: 'Course', headerTintColor: '#16a34a' }} />
      <Stack.Screen name="Lesson" component={LessonScreen}
        options={{ headerShown: true, headerTintColor: '#16a34a' }} />
      <Stack.Screen name="ExamDetail" component={ExamDetailScreen}
        options={{ headerShown: true, title: 'Exam Detail', headerTintColor: '#16a34a' }} />
      <Stack.Screen name="MockTest" component={MockTestScreen}
        options={{ headerShown: true, title: 'Mock Test', headerTintColor: '#16a34a' }} />
      <Stack.Screen name="ForumPost" component={ForumPostScreen}
        options={{ headerShown: true, title: 'Forum', headerTintColor: '#16a34a' }} />
      <Stack.Screen name="ProductDetail" component={ProductDetailScreen}
        options={{ headerShown: true, title: 'Product', headerTintColor: '#16a34a' }} />
      <Stack.Screen name="LiveClass" component={LiveClassScreen}
        options={{ headerShown: true, title: 'Live Class', headerTintColor: '#16a34a' }} />
    </Stack.Navigator>
  )
}
