local Typeface = {  }
--[[ Compatibility Check ]] do
	Typeface.Incompatible	= function() Typeface.Denied = true end
    isfile                  = isfile or Typeface.Incompatible()
    isfolder                = isfolder or Typeface.Incompatible()
    writefile               = writefile or Typeface.Incompatible()
    makefolder              = makefolder or Typeface.Incompatible()
    getcustomasset 			= getcustomasset or Typeface.Incompatible()
end
-- // Variables
local Http = cloneref and cloneref(game:GetService 'HttpService') or game:GetService 'HttpService'
-- // Tables
Typeface.Typefaces = {  }
Typeface.WeightNum = { 
	["Thin"] = 100,
	["ExtraLight"] = 200, 
	["UltraLight"] = 200,
	["Light"] = 300,
	["Normal"] = 400,
	["Regular"] = 400,
	["Medium"] = 500,
	["SemiBold"] = 600,
	["DemiBold"] = 600,
	["Bold"] = 700,
	["ExtraBold"] = 800,
	["UltraBold"] = 900,
	["Heavy"] = 900
}
-- // Functions
function Typeface:Register(Path, Asset)
	Asset = Asset or {}
    Asset.weight = Asset.weight or "Regular"
    Asset.style = Asset.style or "Normal"
    if not Asset.link or not Asset.name then 
        return warn(`{ not Asset.link and "link " or "" }{ not Asset.name and "name " or ""}is required to Register a Typeface!`) 
    end
	if Typeface.Denied then 
        return warn("Executor is Incompatible For Custom Typeface!") 
    end
	local Directory = `{ Path or "" }/{ Asset.name }`
    local Weight = Typeface.WeightNum[Asset.weight] == 400 and "" or Asset.weight
    local Style = string.lower(Asset.style) == "normal" and "" or Asset.style
	local Name = `{ Asset.name }{ Weight }{ Style }`
    if not isfolder(Directory) then
        makefolder(Directory)
    end
    if not isfile(`{ Directory }/{ Name }.font`) then
		writefile(`{ Directory }/{ Name }.font`, game:HttpGet(Asset.link))
	end
    if not isfile(`{ Directory }/{ Asset.name }Families.json`) then 
		local Data = { 
			name = `{ Asset.weight } { Asset.style }`,
			weight = Typeface.WeightNum[Asset.weight] or Typeface.WeightNum[string.gsub(Asset.weight, "%s+", "")],
			style = string.lower(Asset.style),
			assetId = getcustomasset(`{ Directory }/{ Name }.font`)
		}
		local JSONFile = Http:JSONEncode({ name = Name, faces = { Data } })
        warn(`Registering { Asset.name } Typeface to "{ Path }"...`)
		writefile(`{ Directory }/{ Asset.name }Families.json`, JSONFile)
	else
		local Registered = false
        local JSONFile = Http:JSONDecode(readfile(`{ Directory }/{ Asset.name }Families.json`))
		local Data = { 
            name = `{ Asset.weight } { Asset.style }`,
            weight = Typeface.WeightNum[Asset.weight] or Typeface.WeightNum[string.gsub(Asset.weight, "%s+", "")],
            style = string.lower(Asset.style),
            assetId = getcustomasset(`{ Directory }/{ Name }.font`)
		}
        for _, v in JSONFile.faces do
            if v.name == Data.name and v.assetId == Data.assetId then Registered = true end
        end
        if not Registered then
            table.insert(JSONFile.faces, Data)
            JSONFile = Http:JSONEncode(JSONFile)
            warn(`Registering { Asset.weight } { Asset.style } Typeface to "{ Directory }"...`)
            writefile(`{ Directory }/{ Asset.name }Families.json`, JSONFile)
        end
        
	end
	Typeface.Typefaces[Name] = Typeface.Typefaces[Name] or Font.new(getcustomasset(`{ Directory }/{ Asset.name }Families.json`))
    return Typeface.Typefaces[Name]
end
return Typeface
