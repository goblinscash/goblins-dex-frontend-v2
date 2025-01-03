import Link from "next/link";
import React from "react";
import styled from "styled-components";
import { InputWrp, FormWrpper } from "@/Layout/AuthLayout/AuthStyled";
import { useRouter } from "next/router";

const Login = () => {
  const router = useRouter();
  return (
    <FormWrpper className="relative">
      <div className="inner p-3 py-lg-5 py-4 px-lg-5">
        <div className="top pb-3">
          <h6 className="m-0 text-white text-2xl">Log in</h6>
        </div>
        <div className="formWrpper pt-3">
          <div className="grid gap-3 grid-cols-12">
            <div className="col-span-12 py-1">
              <label className="m-0 form-label pb-1 font-normal">
                Email address
              </label>
              <InputWrp className="iconWithText relative">
                <span className="absolute icn" style={{ left: 10 }}>
                  {emailIcn}
                </span>
                <input
                  type="email"
                  placeholder="e.g; erike_e@domain.com"
                  className="form-control pl-10"
                />
              </InputWrp>
            </div>
            <div className="col-span-12 py-1">
              <label className="m-0 form-label pb-1 font-normal">
                Password
              </label>
              <InputWrp className="iconWithText relative">
                <span className="absolute icn" style={{ left: 10 }}>
                  {passwordEye}
                </span>
                <input
                  type="password"
                  placeholder="*********"
                  className="form-control pl-10"
                />
              </InputWrp>
            </div>
            <div className="col-span-12 py-1">
              <div className="flex items-center justify-between">
                <div className="left flex items-center gap-2">
                  <input type="checkbox" className="form-check" />
                  <p className="m-0 text-white text-xs">Remember me</p>
                </div>
                <Link href={""} className="text-white underline text-xs">
                  Forgot password ?
                </Link>
              </div>
            </div>
            <div className="col-span-12 py-3">
              <button
                onClick={() => router.push("/home")}
                className="flex items-center justify-center commonBtn rounded-pill btn text-white w-full border-0"
              >
                Login
              </button>
            </div>
            <div className="col-span-12">
              <div className="text-center">
                <p className="m-0 font-normal text-gray-400 ">
                  Don’t have account?{" "}
                  <Link href={"/sign-up"} className="hover:text-white">
                    Sign up
                  </Link>{" "}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </FormWrpper>
  );
};

Login.authRoute = true;
export default Login;

const emailIcn = (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <g opacity="0.5">
      <path
        d="M17 20.5H7C4 20.5 2 19 2 15.5V8.5C2 5 4 3.5 7 3.5H17C20 3.5 22 5 22 8.5V15.5C22 19 20 20.5 17 20.5Z"
        stroke="#F1F1F1"
        stroke-width="1.5"
        stroke-miterlimit="10"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M17 9L13.87 11.5C12.84 12.32 11.15 12.32 10.12 11.5L7 9"
        stroke="#F1F1F1"
        stroke-width="1.5"
        stroke-miterlimit="10"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </g>
  </svg>
);

const passwordEye = (
  <svg
    width="20"
    height="20"
    viewBox="0 0 26 26"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <g opacity="0.5">
      <path
        d="M12.9999 17.6829C10.4107 17.6829 8.30908 15.5813 8.30908 12.9921C8.30908 10.4029 10.4107 8.30127 12.9999 8.30127C15.5891 8.30127 17.6907 10.4029 17.6907 12.9921C17.6907 15.5813 15.5891 17.6829 12.9999 17.6829ZM12.9999 9.92627C11.3099 9.92627 9.93408 11.3021 9.93408 12.9921C9.93408 14.6821 11.3099 16.0579 12.9999 16.0579C14.6899 16.0579 16.0657 14.6821 16.0657 12.9921C16.0657 11.3021 14.6899 9.92627 12.9999 9.92627Z"
        fill="white"
      />
      <path
        d="M12.9999 22.764C8.92659 22.764 5.08075 20.3807 2.43742 16.2424C1.28909 14.4549 1.28909 11.5407 2.43742 9.74237C5.09159 5.60404 8.93742 3.2207 12.9999 3.2207C17.0624 3.2207 20.9083 5.60404 23.5516 9.74237C24.6999 11.5299 24.6999 14.444 23.5516 16.2424C20.9083 20.3807 17.0624 22.764 12.9999 22.764ZM12.9999 4.8457C9.50075 4.8457 6.15325 6.94737 3.81326 10.6199C3.00076 11.8874 3.00076 14.0974 3.81326 15.3649C6.15325 19.0374 9.50075 21.139 12.9999 21.139C16.4991 21.139 19.8466 19.0374 22.1866 15.3649C22.9991 14.0974 22.9991 11.8874 22.1866 10.6199C19.8466 6.94737 16.4991 4.8457 12.9999 4.8457Z"
        fill="white"
      />
    </g>
  </svg>
);
