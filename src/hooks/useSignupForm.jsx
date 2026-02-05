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
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  /** 회원가입 */
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

  const isFormValid =
    form.username &&
    form.password &&
    form.passwordConfirm &&
    form.email &&
    form.zipcode &&              
    form.address &&
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
