 import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useSnackbar } from "notistack";
import { Formik } from "formik";
import * as Yup from "yup";

import Box from "@mui/material/Box";
import Checkbox from "@mui/material/Checkbox";
import LoadingButton from "@mui/lab/LoadingButton";
import Typography from "@mui/material/Typography";

import MainLayoutl from "../../../../components/MainLayoutl";
import { useAuth } from "app/contexts/AuthContext";

const initialValues = {
  email: "",
  password: "",
  remember: true
};

const validationSchema = Yup.object().shape({
  email: Yup.string()
    .email("ایمیل نادرست است")
    .required("ایمیل ضروری است"),
  password: Yup.string()
    .min(6, "رمز عبور حداقل ۶ حرف باشد")
    .required("رمز عبور ضروری است")
});

export default function Login() {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleFormSubmit = async (values) => {
    try {
      setLoading(true);

      await login(values.email, values.password);

      enqueueSnackbar("ورود موفقانه انجام شد", {
        variant: "success"
      });

      navigate("/dashboard/default");
    } catch (error) {
      enqueueSnackbar(
        error?.response?.data?.message || "ایمیل یا رمز عبور اشتباه است",
        { variant: "error" }
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayoutl title="سیستم مدیریت دواخانه الفلاح">
      <div className="form-container medication-page">
        <h2>ورود به سیستم</h2>

        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleFormSubmit}
        >
          {({
            values,
            errors,
            touched,
            handleChange,
            handleBlur,
            handleSubmit
          }) => (
            <form onSubmit={handleSubmit} noValidate>
              {/* Email */}
              <label htmlFor="email">ایمیل</label>
              <input
                type="email"
                name="email"
                id="email"
                value={values.email}
                onChange={handleChange}
                onBlur={handleBlur}
              />
              {touched.email && errors.email && (
                <div className="error-message">{errors.email}</div>
              )}

              {/* Password */}
              <label htmlFor="password">رمز عبور</label>
              <input
                type="password"
                name="password"
                id="password"
                value={values.password}
                onChange={handleChange}
                onBlur={handleBlur}
              />
              {touched.password && errors.password && (
                <div className="error-message">{errors.password}</div>
              )}

              {/* Remember Me */}
              <Box display="flex" alignItems="center" gap={1} my={2}>
                <Checkbox
                  size="small"
                  name="remember"
                  checked={values.remember}
                  onChange={handleChange}
                />
                <Typography variant="body2">
                  مرا به خاطر بسپار
                </Typography>
              </Box>

              {/* Submit */}
              <LoadingButton
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                loading={loading}
                sx={{ mt: 1 }}
              >
                ورود
              </LoadingButton>

              {/* Signup link */}
              <Typography mt={2} variant="body2">
                حساب ندارید؟
                <NavLink
                  to="/session/signup"
                  style={{ marginLeft: 5, color: "#ffd700" }}
                >
                  ثبت نام
                </NavLink>
              </Typography>
            </form>
          )}
        </Formik>
      </div>
    </MainLayoutl>
  );
}
