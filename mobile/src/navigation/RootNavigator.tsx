import { createNativeStackNavigator } from '@react-navigation/native-stack'
import TabNavigator from './TabNavigator'

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
    <Stack.Screen
      name="Login"
      getComponent={() => require('../screens/Auth/LoginScreen').default}
      options={{ headerShown: true, title: 'Login', headerTintColor: '#16a34a' }} />
    <Stack.Screen
      name="Register"
      getComponent={() => require('../screens/Auth/RegisterScreen').default}
      options={{ headerShown: true, title: 'Create Account', headerTintColor: '#16a34a' }} />
    <Stack.Screen
      name="ForgotPassword"
      getComponent={() => require('../screens/Auth/ForgotPasswordScreen').default}
      options={{ headerShown: true, title: 'Forgot Password', headerTintColor: '#16a34a' }} />
    <Stack.Screen
      name="Courses"
      getComponent={() => require('../screens/Courses/CoursesScreen').default}
      options={{ headerShown: true, title: 'Courses', headerTintColor: '#16a34a' }} />
    <Stack.Screen
      name="Dashboard"
      getComponent={() => require('../screens/Dashboard/DashboardScreen').default}
      options={{ headerShown: true, title: 'Dashboard', headerTintColor: '#16a34a' }} />
    <Stack.Screen
      name="CourseDetail"
      getComponent={() => require('../screens/Courses/CourseDetailScreen').default}
      options={{ headerShown: true, title: 'Course', headerTintColor: '#16a34a' }} />
    <Stack.Screen
      name="Lesson"
      getComponent={() => require('../screens/Courses/LessonScreen').default}
      options={{ headerShown: true, headerTintColor: '#16a34a' }} />
    <Stack.Screen
      name="ExamDetail"
      getComponent={() => require('../screens/Exams/ExamDetailScreen').default}
      options={{ headerShown: true, title: 'Exam Detail', headerTintColor: '#16a34a' }} />
    <Stack.Screen
      name="MockTest"
      getComponent={() => require('../screens/Exams/MockTestScreen').default}
      options={{ headerShown: true, title: 'Mock Test', headerTintColor: '#16a34a' }} />
    <Stack.Screen
      name="ForumPost"
      getComponent={() => require('../screens/Forum/ForumPostScreen').default}
      options={{ headerShown: true, title: 'Forum', headerTintColor: '#16a34a' }} />
    <Stack.Screen
      name="ProductDetail"
      getComponent={() => require('../screens/Marketplace/ProductDetailScreen').default}
      options={{ headerShown: true, title: 'Product', headerTintColor: '#16a34a' }} />
    <Stack.Screen
      name="LiveClass"
      getComponent={() => require('../screens/LiveClasses/LiveClassScreen').default}
      options={{ headerShown: true, title: 'Live Class', headerTintColor: '#16a34a' }} />
    </Stack.Navigator>
  )
}
