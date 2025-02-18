import useTokenLogoUrl from '@/hooks/useTokenLogoUrl';
import React from 'react';

interface LogoProps {
  chainId: number;
  token: string;
}

const Logo: React.FC<LogoProps> = ({ chainId, token }) => {
  const logoUrl = useTokenLogoUrl(chainId, token);

  return (
    <>
      {logoUrl ? (
        <img
          src={logoUrl}
          alt={`${token} logo`}
          title={token}
          style={{ height: 30, marginLeft: -10 }}
          className='max-w-full w-auto rounded-full'
        />
      ) : null}
    </>
  );
};

export default Logo;
