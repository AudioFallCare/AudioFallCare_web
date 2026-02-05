import { useState } from "react";
import api from "../apis/api";

const useSignupForm = () => {
  const [form, setForm] = useState({
    username: "",
    password: "",
    passwordConfirm: "",
    email: "",
    zipcode: "",
    address: "",
    addressDetail: "",
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => {
      const next = { ...prev, [name]: value };

    
      if (
        (name === "password" || name === "passwordConfirm") &&
        next.passwordConfirm &&
        next.password !== next.passwordConfirm
      ) {
        setErrors((prevErr) => ({
          ...prevErr,
          passwordConfirm: "비밀번호가 일치하지 않습니다.",
        }));
      } else if (
        name === "password" ||
        name === "passwordConfirm"
      ) {
        setErrors((prevErr) => ({
          ...prevErr,
          passwordConfirm: "",
        }));
      }

      return next;
    });
  };

  const signup = async () => {
    return await api.post("/auth/signup", {
      username: form.username,
      password: form.password,
      passwordConfirm: form.passwordConfirm,
      email: form.email,
      zipcode: form.zipcode,
      address: form.address,
      addressDetail: form.addressDetail,
    });
  };

  const isEmailValid = /\S+@\S+\.\S+/.test(form.email);

  const isFormValid =
    form.username &&
    form.password &&
    form.passwordConfirm &&
    isEmailValid &&
    form.zipcode &&
    form.address &&
    form.addressDetail &&
    form.password === form.passwordConfirm;

  return {
    form,
    errors,
    isFormValid,
    handleChange,
    signup,
    setForm,
  };
};

export default useSignupForm;
