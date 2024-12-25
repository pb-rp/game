import { FC, useCallback, useRef } from "react";
import style from "../auth.module.scss";
import EventManager from "utils/EventManager.util";
import Notification from "utils/NotifyManager.util";
import registerIcon from "assets/images/auth/icons/register.svg";
export const RegisterForm: FC<{ setForm: (page: string) => void }> = ({ setForm }) => {
    const authForm = useRef<HTMLDivElement>(null);

    const registerUsername = useRef<HTMLInputElement>(null),
        registerEmail = useRef<HTMLInputElement>(null),
        registerPassword = useRef<HTMLInputElement>(null),
        confirmRegisterPassword = useRef<HTMLInputElement>(null);

    const onSubmit = useCallback((e: React.FormEvent) => {
        e.preventDefault();
        const [name, email, password, confirmPass] = [registerUsername.current, registerEmail.current, registerPassword.current, confirmRegisterPassword.current];

        if (!name || !password || !email || !confirmPass || !name.value.length || !password.value.length) {
            Notification.error("Fill out the forms!");
            return;
        }

        EventManager.emitServer("auth", "register", {
            username: name.value,
            email: email.value,
            password: password.value,
            confirmPassword: confirmPass.value
        });

        name.value = "";
        email.value = "";
        password.value = "";
        confirmPass.value = "";
        console.log("test");
    }, []);

    return (
        <div className={style.authform} ref={authForm} onSubmit={(e) => onSubmit(e)}>
            <form autoComplete="off">
                <span onClick={() => setForm("auth")}>Login now!</span>
            </form>
            <div className={style.footer}>
                <span onClick={() => setForm("auth")}>Login now!</span>
            </div>
        </div>
    );
};
