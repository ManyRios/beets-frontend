import { useSwiper, useSwiperSlide } from 'swiper/react';
import { useEffect, useState } from 'react';
import {
    Badge,
    Box,
    Heading,
    HStack,
    Skeleton,
    VStack,
    Text,
    Divider,
    Spacer,
    Button,
    useDisclosure,
    Portal,
} from '@chakra-ui/react';
import useReliquary from '../lib/useReliquary';
import { numberFormatUSDValue } from '~/lib/util/number-formats';
import AprTooltip from '~/components/apr-tooltip/AprTooltip';
import numeral from 'numeral';
import { usePool } from '~/modules/pool/lib/usePool';
import { InfoButton } from '~/components/info-button/InfoButton';
import TokenAvatar from '~/components/token/TokenAvatar';
import { tokenFormatAmount } from '~/lib/services/token/token-util';
import { useRelicPendingRewards } from '../lib/useRelicPendingRewards';
import { sumBy } from 'lodash';
import { useGetTokens } from '~/lib/global/useToken';
import { ReliquaryBatchRelayerApprovalButton } from './ReliquaryBatchRelayerApprovalButton';
import { BeetsSubmitTransactionButton } from '~/components/button/BeetsSubmitTransactionButton';
import { useRelicHarvestRewards } from '../lib/useRelicHarvestRewards';
import BeetsTooltip from '~/components/tooltip/BeetsTooltip';
import { motion } from 'framer-motion';
import { useBatchRelayerHasApprovedForAll } from '../lib/useBatchRelayerHasApprovedForAll';
import RelicMaturityModal from './RelicMaturityModal';

interface Props {}

export default function RelicSlideApr(props: Props) {
    const { pool } = usePool();
    const { isActive } = useSwiperSlide();
    const { isOpen, onOpen, onClose } = useDisclosure();
    const { selectedRelicId, isLoadingRelicPositions, selectedRelicLevel, relicPositions, selectedRelicApr } =
        useReliquary();

    const {
        data: pendingRewards = [],
        refetch: refetchPendingRewards,
        isLoading: isLoadingPendingRewards,
    } = useRelicPendingRewards();
    const [_isLoadingRelicPositions, setIsLoadingRelicPositions] = useState(false);
    const { harvest, ...harvestQuery } = useRelicHarvestRewards();

    // hack to get around next.js hydration issues with swiper
    useEffect(() => {
        setIsLoadingRelicPositions(isLoadingRelicPositions);
    }, [isLoadingRelicPositions]);

    const { data: batchRelayerHasApprovedForAll, refetch } = useBatchRelayerHasApprovedForAll();
    const { priceForAmount } = useGetTokens();
    const pendingRewardsUsdValue = sumBy(pendingRewards, priceForAmount);

    return (
        <>
            <VStack
                left={{ base: '0', lg: '-42.5%' }}
                rounded="md"
                position={{ base: 'relative', lg: 'absolute' }}
                //spacing="4"
                width={{ base: '100%', lg: '60%' }}
                top="0"
                alignItems="flex-start"
                background="whiteAlpha.200"
                p="4"
                hidden={!isActive}
                as={motion.div}
                animate={{
                    opacity: isActive ? 1 : 0,
                    transform: `scale(${isActive ? '1' : '0.75'})`,
                    transition: { delay: 0.1 },
                }}
                minHeight="310px"
                justifyContent="stretch"
            >
                <VStack alignItems="flex-start" height="50%" w="full">
                    <Text lineHeight="1rem" fontWeight="semibold" fontSize="md" color="beets.base.50">
                        Relic APR
                    </Text>
                    <HStack>
                        <div className="apr-stripes">{numeral(selectedRelicApr).format('0.00%')}</div>
                        <AprTooltip onlySparkles data={pool.dynamicData.apr} />
                    </HStack>
                    <BeetsTooltip noImage label="Click here to see the maturity curve.">
                        <HStack
                            as="button"
                            px="3"
                            py="0.5"
                            rounded="md"
                            backgroundColor="beets.light"
                            width={{ base: 'min-content' }}
                            whiteSpace="nowrap"
                            _hover={{ background: 'beets.base.300' }}
                            onClick={onOpen}
                        >
                            <Text fontWeight="semibold">Maturity boost</Text>
                            <Badge bg="none" colorScheme="green" p="1">
                                {selectedRelicLevel?.allocationPoints}x
                            </Badge>
                        </HStack>
                    </BeetsTooltip>
                    <Spacer />
                    <Divider />
                </VStack>
                <VStack alignItems="flex-start" height="50%" w="full" flexGrow="1" pt={{ base: '1', lg: undefined }}>
                    <HStack width="full" spacing="12" alignItems="flex-start" flexGrow="1">
                        <VStack spacing="0" alignItems="flex-start">
                            <InfoButton
                                labelProps={{
                                    lineHeight: '1rem',
                                    fontWeight: 'semibold',
                                    fontSize: 'sm',
                                }}
                                label="My pending rewards"
                                infoText={`Your accumulated liquidity incentives for this relic. You can claim your rewards at any time.`}
                            />
                            {isLoadingPendingRewards ? (
                                <Skeleton height="34px" width="140px" mt="4px" mb="4px" />
                            ) : (
                                <Text color="white" fontSize="1.75rem">
                                    {numberFormatUSDValue(pendingRewardsUsdValue)}
                                </Text>
                            )}
                            <Box>
                                {pendingRewards.map((reward, index) => (
                                    <HStack
                                        key={index}
                                        spacing="1"
                                        mb={index === pendingRewards.length - 1 ? '0' : '0.5'}
                                    >
                                        <TokenAvatar height="20px" width="20px" address={reward.address} />
                                        <Skeleton isLoaded={!isLoadingPendingRewards}>
                                            <Text fontSize="1rem" lineHeight="1rem">
                                                {tokenFormatAmount(reward.amount)}
                                            </Text>
                                        </Skeleton>
                                    </HStack>
                                ))}
                            </Box>
                        </VStack>
                    </HStack>
                    {!batchRelayerHasApprovedForAll ? (
                        <BeetsTooltip label="To claim your pending rewards, you first need to approve the batch relayer.">
                            <Box w="full">
                                <ReliquaryBatchRelayerApprovalButton
                                    onConfirmed={() => {
                                        refetch();
                                    }}
                                />
                            </Box>
                        </BeetsTooltip>
                    ) : (
                        <BeetsSubmitTransactionButton
                            fullWidth
                            width="full"
                            variant="primary"
                            {...harvestQuery}
                            onClick={harvest}
                            onConfirmed={() => {
                                refetchPendingRewards();
                            }}
                        >
                            Claim now
                        </BeetsSubmitTransactionButton>
                    )}
                </VStack>
            </VStack>
            <Portal>
                <RelicMaturityModal isOpen={isOpen} onClose={onClose} />
            </Portal>
        </>
    );
}
