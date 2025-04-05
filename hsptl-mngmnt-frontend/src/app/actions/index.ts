"use server";

import { z } from "zod";
import { AxiosResponse } from "axios";
import { cookies } from "next/headers";
import { LoginSchema } from "@/validators";
import { Login } from "../api/auth/index.s";

const SetTokenAction = async (datas: z.infer<typeof LoginSchema>) => {
  const response = await Login(datas);
  console.log("LOGIN RESPONSE", response);


  if (isAxiosResponse(response)) {
    const data = response.data;

    console.log(data)
    if (data.twoFactorRequired && data.tempToken) {
      return {
        success: false,
        step: "2fa",
        tempToken: data.tempToken,
        message: data.message,
    };
    }

    if (data.sessionToken) {
      cookies().set({
        name: "sessionToken",
        value: data.sessionToken,
        httpOnly: true,
        secure: true,
        path: "/",
      });

      return { success: true, response: response };
    }
  }

  return { success: false, message: response.message || "Login failed" };
};

const isAxiosResponse = (
  response: any
): response is AxiosResponse<any, any> => {
  return (response as AxiosResponse<any, any>).data !== undefined;
};

export { SetTokenAction, isAxiosResponse };
