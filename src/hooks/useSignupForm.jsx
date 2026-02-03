import { useState } from "react";
import api from "../apis/api";

const useSignupForm = () => {
  const [form, setForm] = useState({
    username: "",
    password: "",
    passwordConfirm: "",
    email: "",
    emailCode: "",
    address: "",
    addressDetail: "",
  });

  const [errors, setErrors] = useState({});
  const [emailSent, setEmailSent] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  /** 이메일 인증번호 발송 */
  const sendEmailCode = async () => {
    if (!form.email) {
      setErrors({ email: "이메일을 입력해주세요." });
      return;
    }

    try {
      await api.post("/auth/email/code", { email: form.email });
      setEmailSent(true);
      alert("인증번호가 전송되었습니다.");
    } catch {
      alert("이메일 전송 실패");
    }
  };

  /** 인증번호 확인 */
  const verifyEmailCode = async () => {
    if (!form.emailCode) {
      setErrors({ emailCode: "인증번호를 입력해주세요." });
      return;
    }

    try {
      await api.post("/auth/email/verify", {
        email: form.email,
        code: form.emailCode,
      });
      setEmailVerified(true);
      alert("이메일 인증 완료");
    } catch {
      alert("인증번호가 올바르지 않습니다.");
    }
  };

  /** 회원가입 */
  const signup = async () => {
    await api.post("/auth/signup", {
      username: form.username,
      password: form.password,
      passwordConfirm: form.passwordConfirm,
      email: form.email,
      address: form.address,
      addressDetail: form.addressDetail,
    });
  };

  const isFormValid =
    form.username &&
    form.password &&
    form.passwordConfirm &&
    form.email &&
    form.address &&
    emailVerified &&
    form.password === form.passwordConfirm;

  return {
    form,
    errors,
    emailSent,
    emailVerified,
    isFormValid,
    handleChange,
    sendEmailCode,
    verifyEmailCode,
    signup,
    setForm,
  };
};

export default useSignupForm;
