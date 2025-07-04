import {
  Html,
  Head,
  Preview,
  Text,
  Button,
  Tailwind,
} from "@react-email/components";

export function MagicLinkEmail(props: { url: string; host: string }) {
  const { url, host } = props;

  return (
    <Html lang="en">
      <Head />
      {/* inbox sneak-peek text, keep it < 90 chars */}
      <Preview>Sign-in link for {host}</Preview>

      <Tailwind>
        <Text className="text-sm">
          Click the button below to sign in to <strong>{host}</strong>.
        </Text>

        <Button
          href={url}
          className="bg-indigo-600 text-white rounded-lg py-3 px-6"
        >
          Sign in
        </Button>

        <Text className="text-xs text-gray-500">
          {`If you didn't request this email, you can safely ignore it.`}
        </Text>
      </Tailwind>
    </Html>
  );
}
export default MagicLinkEmail;
