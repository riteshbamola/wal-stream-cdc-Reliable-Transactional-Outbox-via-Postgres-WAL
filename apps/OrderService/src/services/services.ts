import * as repository from "../models/repository";
import { OrderDTO } from "@shared/types";

export const createOrder = async (order: OrderDTO) => {
  try {
    const result = await repository.createOrder(order);
    return result;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
