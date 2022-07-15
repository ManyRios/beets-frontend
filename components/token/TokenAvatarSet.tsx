import {
    Avatar,
    Flex,
    FlexProps,
    Popover,
    PopoverTrigger as OrigPopoverTrigger,
    PopoverContent,
} from '@chakra-ui/react';
import { useGetTokens } from '~/lib/global/useToken';
import Jazzicon, { jsNumberForAddress } from 'react-jazzicon';
import { PoolTokenPill } from '~/components/token/PoolTokenPill';

export interface TokenData {
    address: string;
    weight?: string;
}

interface Props extends FlexProps {
    tokenData: TokenData[];
    imageSize?: number;
    maxAssetsPerLine?: number;
    width: number;
}

function TokenAvatarSet({ width, tokenData, imageSize = 32, maxAssetsPerLine = 5, ...rest }: Props) {
    // temp fix: https://github.com/chakra-ui/chakra-ui/issues/5896#issuecomment-1104085557
    const PopoverTrigger: React.FC<{ children: React.ReactNode }> = OrigPopoverTrigger;
    const { getToken } = useGetTokens();

    const addressesInput = tokenData?.map((token) => token.address);
    const addressesInputLength = addressesInput?.length || 0;
    const numTokens = Math.min(addressesInputLength, maxAssetsPerLine);

    const tokens = tokenData?.map((token) => ({ ...token }));

    const count = Math.min(addressesInputLength, maxAssetsPerLine);

    function leftOffsetFor(index: number) {
        //const spacer = (maxAssetsPerLine / addressesInputLength - 1) * imageSize;
        const spacer = -2.5 * count + imageSize / count;

        return ((width - imageSize + spacer) / (maxAssetsPerLine - 1)) * index;
    }

    return (
        <Popover trigger="hover">
            <PopoverTrigger>
                <button>
                    <Flex
                        {...rest}
                        position={'relative'}
                        //width={(imageSize - 10) * addressesInputLength}
                        height={`${imageSize}px`}
                        width={`${leftOffsetFor(count - 1) + imageSize + 1}px`}
                    >
                        {addressesInput &&
                            addressesInput
                                .slice(0, maxAssetsPerLine)
                                .reverse()
                                .map((address, i) => {
                                    const token = getToken(address);

                                    return (
                                        <Avatar
                                            boxSize={`${imageSize}px`}
                                            //size="sm"
                                            key={i}
                                            src={token?.logoURI || undefined}
                                            //zIndex={10 - i}
                                            left={`${leftOffsetFor(numTokens - i - 1)}px`}
                                            bg={'#181729'}
                                            position="absolute"
                                            icon={<Jazzicon diameter={imageSize} seed={jsNumberForAddress(address)} />}
                                        />
                                    );
                                })}
                    </Flex>
                </button>
            </PopoverTrigger>
            <PopoverContent w="fit-content" bgColor="beets.base.800" shadow="2xl" p="1">
                {tokens?.map((token, index) => (
                    <PoolTokenPill key={index} token={token} rounded={false} />
                ))}
            </PopoverContent>
        </Popover>
    );
}

export default TokenAvatarSet;
