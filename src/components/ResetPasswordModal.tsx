import React from 'react';
import { StyledText as Text } from '_components/Text/StyledText';
import { View, Alert, Button, Modal, Pressable } from 'react-native';
import { ControlledInput } from '_components/Input/ControlledInput';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from 'src/store/authStore/auth.store';
import { useTranslation } from 'react-i18next';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import IonIcons from '@expo/vector-icons/Ionicons';
import { emailSchema } from '_utils/auth.schema';
import * as Clipboard from 'expo-clipboard';
import Toast from 'react-native-root-toast';

type ResetModalProps = {
  visible: boolean;
  close: () => void;
};
const schema = z.object({
  email: emailSchema,
});
export function ResetPasswordModal({ visible, close }: ResetModalProps) {
  const { t } = useTranslation();
  const { top } = useSafeAreaInsets();

  const { control, handleSubmit, reset } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      email: '',
    },
  });

  const resetPassword = useAuth(({ resetPassword }) => resetPassword);

  const onSubmit = handleSubmit(({ email }) => {
    const result = resetPassword(email);

    if (typeof result !== 'string') {
      const { error } = result;

      Alert.alert(t(error));
      reset();
      return;
    }

    Alert.alert(t('auth.your-new-password'), result, [
      {
        text: t('copy-to-clipboard'),
        onPress: () => {
          Clipboard.setStringAsync(result).then(() => {
            Toast.show(t('copied-to-clipboard'), {
              duration: Toast.durations.SHORT,
            });
            close();
          });
        },
      },
    ]);
  });

  return (
    <Modal visible={visible} animationType="slide">
      <SafeAreaView className="flex-1 h-screen" style={{ top }}>
        <View className="flex items-center flex-row justify-between w-full px-4 border-b border-slate-100">
          <Text className="font-bold text-lg">{t('auth.reset-password')}</Text>
          <Pressable className="p-2" onPress={close}>
            <IonIcons name="close" size={24} />
          </Pressable>
        </View>
        <View className="mt-4 p-4">
          <Text className="font-bold mb-2">{t('auth.email')}</Text>
          <ControlledInput
            className="p-4 text-slate-900 w-full bg-slate-100 shadow-sm"
            keyboardType="email-address"
            placeholder="joe@acme.com"
            control={control}
            name="email"
          />
          <View className="mt-4">
            <Button title={t('auth.reset')} onPress={onSubmit} />
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
}
