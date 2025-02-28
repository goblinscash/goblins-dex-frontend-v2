import useTokenLogoUrl from '@/hooks/useTokenLogoUrl';
import React from 'react';

interface LogoProps {
  chainId: number;
  token: string;
  margin: number;
  height: number;
}

const Logo: React.FC<LogoProps> = ({ chainId, token, margin= -10, height= 30 }) => {
  const logoUrl = useTokenLogoUrl(chainId, token);

  return (
    <>
      {logoUrl ? (
        <img
          src={logoUrl}
          alt={`${token} logo`}
          title={token}
          style={{ height: height, marginLeft: margin }}
          className='max-w-full w-auto rounded-full'
        />
      ) : null}
    </>
  );
};

export default Logo;
