import { prisma as defaultPrisma } from '../prisma';

// Create a type for our prisma client instance
type PrismaClientType = typeof defaultPrisma;

// Create a new wallet address
export const createWalletAddress = async (
	network: string,
	address: string,
	isActive: boolean = true
) => {
	// Validate inputs
	if (!network || !address) {
		throw new Error('Network and address are required');
	}

	// Check if a wallet address with the same network and address already exists
	const existingWallets = await defaultPrisma.walletAddress.findMany({
		where: {
			address,
			network
		}
	});

	if (existingWallets.length > 0) {
		throw new Error('A wallet address with this network and address already exists');
	}

	// If this wallet should be active, deactivate other active wallets for the same network
	if (isActive) {
		await defaultPrisma.walletAddress.updateMany({
			where: {
				network,
				isActive: true
			},
			data: {
				isActive: false
			}
		});
	}

	// Create the wallet address
	const walletAddress = await defaultPrisma.walletAddress.create({
		data: {
			network,
			address,
			isActive
		}
	});

	return walletAddress;
};

// Get all wallet addresses with optional filtering
export const getWalletAddresses = async (filters?: { network?: string; isActive?: boolean }) => {
	const whereClause = {
		...(filters?.network && { network: filters.network }),
		...(filters?.isActive !== undefined && { isActive: filters.isActive })
	};

	const walletAddresses = await defaultPrisma.walletAddress.findMany({
		where: whereClause,
		orderBy: {
			createdAt: 'desc'
		}
	});

	return walletAddresses;
};

// Get the active wallet address for a specific network
export const getActiveWalletAddressByNetwork = async (network: string) => {
	if (!network) {
		throw new Error('Network is required');
	}

	const walletAddress = await defaultPrisma.walletAddress.findFirst({
		where: {
			network,
			isActive: true
		}
	});

	return walletAddress;
};

// Update an existing wallet address
export const updateWalletAddress = async (
	id: string,
	data: {
		network?: string;
		address?: string;
		isActive?: boolean;
	}
) => {
	// Validate inputs
	if (!id) {
		throw new Error('Wallet address ID is required');
	}

	// Check if wallet address exists
	const existingWallet = await defaultPrisma.walletAddress.findUnique({
		where: { id }
	});

	if (!existingWallet) {
		throw new Error('Wallet address not found');
	}

	// If updating address and network, check for duplicates
	if (data.address || data.network) {
		const network = data.network || existingWallet.network;
		const address = data.address || existingWallet.address;

		const duplicateWallets = await defaultPrisma.walletAddress.findMany({
			where: {
				address,
				network
			}
		});

		const duplicateWallet = duplicateWallets.find((wallet) => wallet.id !== id);
		if (duplicateWallet) {
			throw new Error('A wallet address with this network and address already exists');
		}
	}

	// If setting this wallet as active, deactivate other active wallets for the same network
	if (data.isActive === true) {
		await defaultPrisma.walletAddress.updateMany({
			where: {
				network: data.network || existingWallet.network,
				isActive: true
			},
			data: {
				isActive: false
			}
		});
	}

	// Update the wallet address
	const updatedWallet = await defaultPrisma.walletAddress.update({
		where: { id },
		data: {
			...(data.network !== undefined && { network: data.network }),
			...(data.address !== undefined && { address: data.address }),
			...(data.isActive !== undefined && { isActive: data.isActive }),
			updatedAt: new Date()
		}
	});

	return updatedWallet;
};

// Delete a wallet address
export const deleteWalletAddress = async (id: string) => {
	// Validate inputs
	if (!id) {
		throw new Error('Wallet address ID is required');
	}

	// Check if wallet address exists
	const existingWallet = await defaultPrisma.walletAddress.findUnique({
		where: { id }
	});

	if (!existingWallet) {
		throw new Error('Wallet address not found');
	}

	// Delete the wallet address
	await defaultPrisma.walletAddress.delete({
		where: { id }
	});

	return { success: true };
};

// Activate a wallet address and deactivate others in the same network
export const activateWalletAddress = async (id: string) => {
	// Validate inputs
	if (!id) {
		throw new Error('Wallet address ID is required');
	}

	// Check if wallet address exists
	const walletToActivate = await defaultPrisma.walletAddress.findUnique({
		where: { id }
	});

	if (!walletToActivate) {
		throw new Error('Wallet address not found');
	}

	// Deactivate all other wallet addresses for the same network
	await defaultPrisma.walletAddress.updateMany({
		where: {
			network: walletToActivate.network,
			isActive: true,
			id: {
				not: id
			}
		},
		data: {
			isActive: false
		}
	});

	// Activate the selected wallet address
	const activatedWallet = await defaultPrisma.walletAddress.update({
		where: { id },
		data: {
			isActive: true,
			updatedAt: new Date()
		}
	});

	return activatedWallet;
};
