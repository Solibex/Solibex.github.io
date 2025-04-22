local clone_reference = cloneref or function(...)
    return ... 
end

local http_service = clone_reference(game:GetService('HttpService'))

local fonts = {
    loaded = {}
}
local directory = 'fishy_fonts'
local assets_directory = string.format('%*/%*', directory, 'assets')

function fonts.load(name, link)
    if not (name and link) then
        return print('fonts load missing args')
    end

    if not isfolder(directory) then
        makefolder(directory)
    end
    
    if not isfolder(assets_directory) then
        makefolder(assets_directory)
    end
    
    local data_path = string.format('%*/%*.fontdata', directory, name)
    
    if not isfile(data_path) then
        local success, result = pcall(game.HttpGet, game, link)

        if success then
            writefile(data_path, result)
        else
            return warn(string.format('fonts load failed to download link %*', link))
        end
    end

    repeat task.wait() until isfile(data_path)

    local data = {
        name = name,
        weight = 400,
        style = "normal",
        assetId = getcustomasset(data_path)
    }

    local asset_json = http_service:JSONEncode({ name = name, faces = { data } })
    local asset_path = string.format('%*/%*.json', assets_directory, name)
	writefile(asset_path, asset_json)

    return Font.new(getcustomasset(asset_path))
end

return fonts
