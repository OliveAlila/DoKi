/**
 * NativeWind v4 interop setup.
 * Call cssInterop once per native component to enable className → style mapping.
 * Import this file ONCE, early in your app entry point (before component renders).
 */
import {
  View,
  Text,
  Pressable,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  FlatList,
  Image,
  TextInput,
} from 'react-native';
import { cssInterop } from 'nativewind';

cssInterop(View, { className: 'style' });
cssInterop(Text, { className: 'style' });
cssInterop(Pressable, { className: 'style' });
cssInterop(TouchableOpacity, { className: 'style' });
cssInterop(SafeAreaView, { className: 'style' });
cssInterop(ScrollView, { className: 'style' });
cssInterop(FlatList, { className: 'style' });
cssInterop(Image, { className: 'style' });
cssInterop(TextInput, { className: 'style' });
