import { SignUp } from '@clerk/nextjs';

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <h1 className="text-4xl font-bold text-center mb-8 glitch-text neon-glow" data-text="Sign Up">
          Sign Up
        </h1>
        <div className="neon-border rounded-lg p-1">
          <SignUp 
            appearance={{
              elements: {
                rootBox: 'mx-auto',
                card: 'bg-black/80 backdrop-blur-sm border border-purple-500/30',
                headerTitle: 'text-white',
                headerSubtitle: 'text-gray-400',
                socialButtonsBlockButton: 'border border-purple-500/50 hover:bg-purple-500/20',
                formButtonPrimary: 'bg-purple-600 hover:bg-purple-700',
                footerActionLink: 'text-purple-400 hover:text-purple-300',
              }
            }}
          />
        </div>
      </div>
    </div>
  );
}
