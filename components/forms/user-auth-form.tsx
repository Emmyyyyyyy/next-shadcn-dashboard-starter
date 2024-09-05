'use client';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { zodResolver } from '@hookform/resolvers/zod';
import { error } from 'console';
import { signIn } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

const formSchema = z.object({
  mobile_number: z.string().min(10, { message: 'Enter a valid mobile number' }),
  otp: z.string().optional() // OTP is optional initially
});

type UserFormValue = z.infer<typeof formSchema>;

export default function UserAuthForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl');
  const [loading, setLoading] = useState(false);
  const [otpRequested, setOtpRequested] = useState(false);

  const form = useForm<UserFormValue>({
    resolver: zodResolver(formSchema),
    defaultValues: { mobile_number: '', otp: '' }
  });

  const onSubmit = async (data: UserFormValue) => {
    setLoading(true);

    if (!otpRequested) {
      // Request OTP
      const result = await signIn('credentials', {
        mobile_number: data.mobile_number,
        redirect: false
      });

      if (result?.error) {
        console.log('error');
        console.log(result?.error);

        form.setError('mobile_number', {
          type: 'manual',
          message: result.error
        });
      } else {
        console.log('sucess');
        setOtpRequested(true);
      }
    } else {
      // Verify OTP
      console.log('otp');

      const result = await signIn('credentials', {
        mobile_number: data.mobile_number,
        otp: data.otp,
        callbackUrl: callbackUrl ?? '/dashboard'
        // redirect: true
      });

      if (result?.error) {
        form.setError('otp', { type: 'manual', message: result.error });
      }
    }

    setLoading(false);
  };

  return (
    <>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="w-full space-y-2"
        >
          <FormField
            control={form.control}
            name="mobile_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mobile</FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    placeholder="Enter your mobile number..."
                    disabled={loading || otpRequested}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {otpRequested && (
            <FormField
              control={form.control}
              name="otp"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>OTP</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder="Enter the OTP..."
                      disabled={loading}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <Button disabled={loading} className="ml-auto w-full" type="submit">
            {otpRequested ? 'Verify OTP' : 'Request OTP'}
          </Button>
        </form>
      </Form>
    </>
  );
}
