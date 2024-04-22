import {
  useState,
  type MouseEventHandler,
  type PropsWithChildren,
} from "react";
import {
  faArrowRotateLeft,
  faExternalLink,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { AxiosError } from "axios";
import { twMerge } from "tailwind-merge";

import { useGoogleDriveAPI } from "src/hooks/useGoogleDriveAPI";
import { useLanguageContext } from "src/contexts/LanguageContext";
import { useSpinnerMenuContext } from "src/contexts/SpinnerMenuContext";
import { useUser } from "src/contexts/UserContext";
import LanguageSelect from "src/components/LanguageSelect";
import Spinner from "src/components/common/Spinner";
import ThemedButton from "src/components/common/ThemedButton";

function Header({ children }: PropsWithChildren) {
  return <h1 className="text-2xl">{children}</h1>;
}

function Section({
  children,
  danger,
}: PropsWithChildren<{
  danger?: true;
}>) {
  return (
    <div
      className={twMerge(
        "flex flex-col gap-2 rounded-md border border-gray-600 p-4",
        danger && "border-red-500",
      )}
    >
      {children}
    </div>
  );
}

function useGoogleDriveFilesCleaner() {
  const { fetchList, deleteFile } = useGoogleDriveAPI();

  const cleanGoogleDrive = async () => {
    const { status, data: files } = await fetchList();

    if (status !== 200 || files.error) {
      throw new AxiosError(
        `Could not get files: (HTTP ${status}) ${files.error.message || ""}`,
      );
    }

    const fileIds = files.files?.map((file) => file.id) || [];

    for (const fileId of fileIds) {
      await deleteFile({ id: fileId });
    }
  };

  return cleanGoogleDrive;
}

function useDisconnectAccount() {
  const { user } = useUser();

  const disconnectAccount = () =>
    new Promise<google.accounts.id.RevocationResponse>(
      (resolve, reject: (reason: Error) => void) => {
        if (!user) return reject(new Error("User not found"));

        google.accounts.id.revoke(
          user.email,
          (done: google.accounts.id.RevocationResponse) => {
            gapi.auth.signOut();

            if (done.successful) return resolve(done);
            else return reject(new Error(done.error));
          },
        );

        return null;
      },
    );

  return disconnectAccount;
}

export default function Settings() {
  const { t } = useLanguageContext();
  const { resetConfigFile } = useSpinnerMenuContext();
  const [isWorking, setIsWorking] = useState<{
    reset?: boolean;
    unlink?: boolean;
  }>();
  const { logout } = useUser();
  const cleanGoogleDrive = useGoogleDriveFilesCleaner();
  const disconnectAccount = useDisconnectAccount();
  const [error, setError] = useState<string>();

  const displayError = (error: unknown) => {
    if (typeof error === "object" && error && "message" in error)
      setError(`Could not reset files: ${error.message}`);
    else {
      setError("An unknown error ocurred");
      console.error(error);
    }

    setTimeout(() => setError(undefined), 3000);
  };

  const resetSpinnerMenu: MouseEventHandler<HTMLButtonElement> = async () => {
    // Show confirmation
    if (!window.confirm(t("SettingsPage.data.resetConfirmation"))) return;

    setIsWorking({ reset: true });

    try {
      await cleanGoogleDrive();
      await resetConfigFile();
    } catch (error) {
      displayError(error);
    } finally {
      setIsWorking(undefined);
    }
  };

  const unlinkAccount: MouseEventHandler<HTMLButtonElement> = async () => {
    setIsWorking({ unlink: true });

    try {
      await cleanGoogleDrive();
      await disconnectAccount();
      logout({ notification: t("SettingsPage.account.disconnected") });
    } catch (error) {
      displayError(error);
    } finally {
      setIsWorking(undefined);
    }
  };

  return (
    <div className="flex flex-col gap-4 p-6">
      {error && (
        <div className="fixed left-0 top-0 rounded-sm bg-red-500 p-2 text-white">
          {error}
        </div>
      )}

      <Header>{t("SettingsPage.header")}</Header>

      <Section>
        <a
          className="flex items-center gap-2 hover:underline"
          href="https://drive.google.com/drive/settings"
          target="_blank"
          rel="noreferrer"
        >
          <span>{t("SettingsPage.Drive.open")}</span>
          <FontAwesomeIcon icon={faExternalLink} />
        </a>
        <p className="text-sm text-slate-300">
          {t("SettingsPage.Drive.description")}
        </p>
      </Section>

      <Section>
        <p>{t("SettingsPage.language.change")}</p>
        <LanguageSelect />
      </Section>

      <Header>{t("SettingsPage.moreOptions.header")}</Header>

      <Section>
        <div className="flex justify-between">
          {t("SettingsPage.data.manage")}
          {isWorking?.reset && <Spinner />}
        </div>
        <ThemedButton
          className="w-max"
          icon={faArrowRotateLeft}
          disabled={!!isWorking}
          onClick={resetSpinnerMenu}
        >
          {t("SettingsPage.data.reset")}
        </ThemedButton>
      </Section>

      <Header>{t("SettingsPage.account.header")}</Header>

      <Section danger>
        <div className="flex justify-between">
          {t("SettingsPage.account.revoke")}
          {isWorking?.unlink && <Spinner />}
        </div>
        <ThemedButton
          danger
          className="w-max"
          disabled={!!isWorking}
          onClick={unlinkAccount}
        >
          {t("SettingsPage.account.disconnect")}
        </ThemedButton>
      </Section>
    </div>
  );
}
