import { createTheme } from "@mui/material/styles";
import i18n from "./i18n";

const theme = createTheme({
  direction: i18n.language === "fa" ? "rtl" : "ltr",
});

export default theme;
