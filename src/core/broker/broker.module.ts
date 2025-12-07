import { Module } from "@nestjs/common";
import { BrokerService } from "./broker.service";

@Module({
    imports:[],
    providers:[BrokerService],
    exports:[BrokerService]
})
export class BrokerModule{}