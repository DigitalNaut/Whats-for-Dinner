import {
  type MouseEventHandler,
  type PropsWithChildren,
  useState,
} from "react";
import { AxiosError } from "axios";
import { twMerge } from "tailwind-merge";

import { useGoogleDriveAPI } from "src/hooks/useGoogleDriveAPI";
import { useLanguageContext } from "src/contexts/LanguageContext";
import { useSpinnerMenuContext } from "src/contexts/SpinnerMenuContext";
import { useUser } from "src/contexts/UserContext";
import FontAwesomeIcon from "src/components/common/FontAwesomeIcon";
import LanguageSelect from "src/components/LanguageSelect";
import Spinner from "src/components/common/Spinner";
import ThemedButton from "src/components/common/ThemedButton";

async function executePromises<T>(
  promises: Promise<T>[],
  progressFn: (progress: number) => void,
) {
  const results: { id: number; result: T }[] = [];
  const errors: { id: number; error: Error }[] = [];

  return new Promise<[typeof results, typeof errors]>((resolve) => {
    for (let id = 0; id < promises.length; id++) {
      const promise = promises[id];
      promise
        .then((result) => {
          results.push({ id, result });
        })
        .catch((error: Error) => {
          errors.push({ id, error });
        })
        .finally(() => {
          const processed = results.length + errors.length;
          const progress = processed / promises.length;
          progressFn(parseFloat(progress.toFixed(2)));

          if (processed === promises.length) resolve([results, errors]);
        });
    }
  });
}

function useGoogleDriveFilesCleaner() {
  const [progress, setProgress] = useState<number>();
  const { fetchList, deleteFile } = useGoogleDriveAPI();

  async function getDriveFileIds() {
    const fileIds = new Set<string>();
    let nextPageToken: string | undefined;

    do {
      const { status, data } = await fetchList({
        params: { pageSize: 3, pageToken: nextPageToken },
      });

      if ("error" in data)
        throw new AxiosError(
          `Could not get files: (HTTP ${status}) ${data.error.message}`,
        );

      nextPageToken = data.nextPageToken;

      for (const file of data.files || []) {
        if (file.id) fileIds.add(file.id);
      }
    } while (nextPageToken);

    return fileIds;
  }

  const cleanGoogleDrive = async () => {
    const fileIdSet = await getDriveFileIds();
    const fileIds = Array.from(fileIdSet.values());

    const [filesDeleted, deleteErrors] = await executePromises(
      fileIds.map((id) => deleteFile({ id })),
      setProgress,
    );

    return { filesDeleted, deleteErrors };
  };

  return { cleanGoogleDrive, progress };
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

export default function Settings() {
  const { t } = useLanguageContext();
  const { resetConfigFile } = useSpinnerMenuContext();
  const [isWorking, setIsWorking] = useState<{
    reset?: boolean;
    unlink?: boolean;
  }>();
  const { logout } = useUser();
  const { cleanGoogleDrive, progress: cleaningProgress } =
    useGoogleDriveFilesCleaner();
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
          <FontAwesomeIcon className="fa-external-link" />
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
          {isWorking?.reset && cleaningProgress !== undefined && (
            <Spinner text={`Deleting files: ${cleaningProgress * 100}%`} />
          )}
        </div>
        <ThemedButton
          iconStyle="fa-arrow-rotate-left"
          className="w-max"
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
          {isWorking?.unlink && cleaningProgress !== undefined && (
            <Spinner text={`Deleting files: ${cleaningProgress * 100}%`} />
          )}
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
